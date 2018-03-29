var lineArr = [], barArr = [];
seedBarChart()

$(document).ready(function(){
    width = $('.container').width()
    obj = new Chart(width, height, margin)


    $("#init_button").on("click", function(){
      for(var i = 0; i < parseInt($('.graph_init input').val()); i++)
        obj.addModule("barchart")
      obj.draw()
      $("#init_button").attr('disabled', true)
      $('.graph_init input').attr('disabled', true)

    })



});



function randomNumberBounds(min, max) {
  return Math.floor(Math.random() * (max-min+1)+min);
}

function seedBarChart(){
  var MAX_LENGTH = 500;
  for(var i=0; i < MAX_LENGTH; i++){
    barArr.push(randomNumberBounds(25,80))
  }
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
