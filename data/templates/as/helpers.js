function execTime(over){
  var a = [];
  time = 1000*60*60;
  time = 1000;
  over.forEach((o)=>a.push((o.ex/time).toFixed(2)))
  return a;
}

function testData(over){
  var a = [];
  over.forEach((o)=>a.push(o.ts.toString()))
  return JSON.stringify(a);
}
