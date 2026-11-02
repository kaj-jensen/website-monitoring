const repo=process.env.GITHUB_REPOSITORY;
const headers={Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','Content-Type':'application/json'};
const result=await fetch(`https://api.github.com/repos/${repo}/issues`,{method:'POST',headers,body:JSON.stringify({title:'[Monitor test] Alert delivery verification',body:`This is a single, manually requested pilot alert-delivery test. No website failure is being reported.\n\n[Verification run](https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}).`})});
if(!result.ok)throw new Error(`Notification test failed: ${result.status}`);
const issue=await result.json();console.log(`Alert-delivery test: ${issue.html_url}`);
