import {test} from 'node:test';
import assert from 'node:assert/strict';
import {transition} from './incidents.mjs';
test('confirms failure, suppresses repeats, confirms recovery', () => {
  let result=transition({},false); assert.equal(result.action,null);
  result=transition(result.state,false); assert.equal(result.action,'open');
  for(let n=0;n<20;n++){ result=transition(result.state,false); assert.equal(result.action,null); }
  result=transition(result.state,true); assert.equal(result.action,null); assert.equal(result.state.open,true);
  result=transition(result.state,true); assert.equal(result.action,'close');
  result=transition(result.state,true); assert.equal(result.action,null);
});
test('isolated failures and unstable recovery do not flap alerts',()=>{
  let state={};
  for(let n=0;n<20;n++){let r=transition(state,n%2===0);assert.equal(r.action,null);state=r.state;}
  let r=transition({open:true,failures:2},true);assert.equal(r.action,null);
  r=transition(r.state,false);assert.equal(r.state.successes,0);assert.equal(r.action,null);
});
