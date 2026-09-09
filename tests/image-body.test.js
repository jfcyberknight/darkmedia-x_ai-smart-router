const {test}=require('node:test');
const assert=require('node:assert/strict');
const app=require('../server');
test('large image endpoint accepts transport, other routes stay bounded',async()=>{
 const server=app.listen(0,'127.0.0.1'); await new Promise(r=>server.once('listening',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 try {
  for(const [path,length,status] of [['/v1/chat/completions',600000,401],['/api/chat',600000,413],['/v1/chat/completions',16*1024*1024,413]]){
   const r=await fetch(base+path,{method:'POST',headers:{'content-type':'application/json'},body:' '.repeat(length)});
   assert.equal(r.status,status,path);assert.match(r.headers.get('content-type'),/json/);
  }
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});
