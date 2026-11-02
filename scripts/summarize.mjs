import { readFileSync, appendFileSync } from 'node:fs';
const expected = { ole: 2, fortaleza: 4, cumbuco: 2, aguia: 4 };
let observed = {monitor: false};
try {
  const report = JSON.parse(readFileSync('results.json', 'utf8'));
  const specs = [];
  function visit(suite) { specs.push(...(suite.specs || [])); for (const child of suite.suites || []) visit(child); }
  visit(report);
  const counts = Object.fromEntries(Object.keys(expected).map(key => [key, []]));
  for (const spec of specs) {
    const site = /^\[(ole|fortaleza|cumbuco|aguia)\]/.exec(spec.title)?.[1];
    if (site) counts[site].push(...spec.tests);
  }
  if (report.errors?.length || Object.entries(expected).some(([site, count]) => counts[site].length !== count)) throw new Error('Incomplete test report');
  observed = { monitor: true };
  for (const site of Object.keys(expected)) observed[site] = counts[site].every(test => ['expected', 'flaky'].includes(test.status));
} catch { console.error('Monitor infrastructure failed or test report was incomplete. Website recovery will not be assumed.'); }
appendFileSync(process.env.GITHUB_OUTPUT || '/dev/stdout', `results=${JSON.stringify(observed)}\n`);
