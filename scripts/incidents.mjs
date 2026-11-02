import { readFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
export const sites = ['ole', 'fortaleza', 'cumbuco', 'aguia', 'monitor'];
export function transition(previous = {}, ok) {
  const state = { failures: 0, successes: 0, open: false, ...previous };
  state.failures = ok ? 0 : Math.min(2, state.failures + 1);
  state.successes = ok ? Math.min(2, state.successes + 1) : 0;
  const action = !state.open && state.failures === 2 ? 'open' : state.open && state.successes === 2 ? 'close' : null;
  if (action) state.open = action === 'open';
  return { state, action };
}
export async function publish() {
  const repo = process.env.GITHUB_REPOSITORY;
  if (process.env.REPO_VISIBILITY !== 'public') throw new Error('Monitoring requires a public repository to avoid private-runner charges.');
  const headers = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' };
  async function api(path, method = 'GET', data, allow404 = false) {
    const response = await fetch(`https://api.github.com/repos/${repo}/${path}`, { method, headers, body: data ? JSON.stringify(data) : undefined });
    if (allow404 && response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub ${method} ${path.split('?')[0]} returned ${response.status}`);
    return response.status === 204 ? null : response.json();
  }
  const observed = JSON.parse(process.env.MONITOR_RESULTS || '{}');
  if (Object.keys(observed).some(key => !sites.includes(key)) || Object.values(observed).some(value => typeof value !== 'boolean')) throw new Error('Invalid monitoring result');
  const stateFile = await api('contents/state.json?ref=monitor-state', 'GET', undefined, true);
  const saved = stateFile ? JSON.parse(Buffer.from(stateFile.content, 'base64').toString()) : { sites: {} };
  if (saved.lastRun === process.env.GITHUB_RUN_ID) return;
  const issues = await api('issues?state=open&per_page=100');
  const runUrl = `https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  let summary = '| Site | Check | Incident |\n|---|---|---|\n';
  for (const site of sites) {
    if (!(site in observed)) continue; // Infrastructure failures never count as website recovery.
    const title = `[Monitor] ${site === 'monitor' ? 'Monitoring system' : site}: functionality failure`;
    const existing = issues.find(issue => issue.title === title && issue.body?.includes('<!-- website-monitor -->') && !issue.pull_request);
    const previous = { ...saved.sites[site], open: Boolean(existing) };
    const { state, action } = transition(previous, observed[site]);
    if (action === 'open') {
      const issue = await api('issues', 'POST', { title, body: `<!-- website-monitor -->\nTwo consecutive monitoring runs failed after browser retries.\n\n[View the failing check and logs](${runUrl}).\n\nThis incident receives no repeat alerts while it remains open. It closes after two consecutive successful runs. No real enquiries are submitted by these checks.` });
      state.issue = issue.number;
    } else if (action === 'close' && existing) {
      await api(`issues/${existing.number}/comments`, 'POST', { body: `Recovered: two consecutive successful monitoring runs. [Latest verification](${runUrl}).` });
      await api(`issues/${existing.number}`, 'PATCH', { state: 'closed', state_reason: 'completed' });
      delete state.issue;
    } else if (existing) state.issue = existing.number;
    saved.sites[site] = state;
    summary += `| ${site} | ${observed[site] ? 'Passing' : 'Failing'} | ${state.open ? 'Open' : state.failures ? 'Awaiting confirmation' : 'Clear'} |\n`;
  }
  saved.lastRun = process.env.GITHUB_RUN_ID;
  if (!stateFile) {
    const main = await api(`git/ref/heads/${process.env.GITHUB_REF_NAME}`);
    const branch = await api('git/ref/heads/monitor-state', 'GET', undefined, true);
    if (!branch) await api('git/refs', 'POST', { ref: 'refs/heads/monitor-state', sha: main.object.sha });
  }
  await api('contents/state.json', 'PUT', { branch: 'monitor-state', message: 'Update monitoring incident state', content: Buffer.from(JSON.stringify(saved, null, 2) + '\n').toString('base64'), ...(stateFile ? {sha:stateFile.sha} : {}) });
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await publish();
