
function randomScatterValues(){
  var MAX_LENGTH = 50;
  for(var i=0; i < MAX_LENGTH; i++){
    scatterArr.push([randomNumberBounds(0,100),randomNumberBounds(10,90),randomNumberBounds(0,10)])
  }
}

function randomNumberBounds(min, max) {
  return Math.floor(Math.random() * (max-min+1)+min);
}

function seedBarChart(){
  var MAX_LENGTH = 500;
  for(var i=0; i < MAX_LENGTH; i++){
    barArr.push(randomNumberBounds(25,80))
  }
}

function incrementBarChart(){
  barArr.push(randomNumberBounds(30,70))
}
function simulateOutlier(){
    let now = new Date()
    obj.data.push({
        ts: now.getTime(),
        data: 120
    })
}
function barchartDemo(){
  incrementBarChart()
  obj.update()
}

function expo(x, f) {
  return Number.parseFloat(x).toExponential(f);
}

function transformDate(date){
    return  ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2)
}
function insideBox(point, box){
    var x = point.x ,
        y = point.y

    var xBox = box.x,
        yBox = box.y,
        width = box.width,
        height = box.height
    //console.log('Point: ')
    //console.log(point)
    //console.log('Box  : ')
    //console.log(box)
    return ( x >= xBox && x < xBox + width && y >= yBox && y < yBox + height)
}

function groupBarChart(){
  /* TODO : SCALES AND RANGES */
  domain = [0,100]
  max = Math.max.apply(Math, domain);
  slices = max / 10

  var values = new Array(slices).fill(0)
  barArr.forEach(function(el){
    values[(Math.ceil(el/slices) - 1)] += 1
  })
  return values
}
function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}
function seedData() {
  var now = new Date();
  var MAX_LENGTH = 100;
  var duration = 500;
  for (var i = 0; i < MAX_LENGTH; ++i) {
    lineArr.push({
      time: new Date(now.getTime() - ((MAX_LENGTH - i) * duration)),
      x: randomNumberBounds(0, 5),
      y: randomNumberBounds(0, 2.5),
      z: randomNumberBounds(0, 10)
    });
  }
}
