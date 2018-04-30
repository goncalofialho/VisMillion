var lineArr = [], barArr = [], scatterArr = [], bufferData = [] ;
seedBarChart()
var fps, time0, time1;
var domain = [0,100]
var arr;
$(document).ready(function(){

    width = $('.container').width()
    obj = new Chart(width, height, margin)
    time0 = Date.now()
    fps = d3.select('#fps span')

    $("input").bind('keyup mouseup', function () {
      var n_selects = parseInt($(this).val())
      var clone = $('select.d-none').clone()
      for(var i=0;i<n_selects;i++){
          clone.removeClass('d-none')
          $('.selects').append(clone)
      }
    });

    $("#init_button").on("click", function(){
      $('select:not(.d-none)').each(function(){
        var mod_type = $(this).find('option:selected').attr('chart')
        obj.addModule(mod_type)
      })
      //for(var i = 0; i < parseInt($('.graph_init input').val()); i++)
    /*    obj.addModule("barchart")
        obj.addModule("linechart")
        obj.addModule("scatterchart")*/

      $("#init_button").attr('disabled', true)
      $('.graph_init input').attr('disabled', true)
      $('select').attr('disabled',true)

    })
    /*
    arr = []
	var ts = new Date().getTime()
	for(let i = 0; i<50 ; i++){
		var newts = ts - (i * randomNumberBounds(100,300))
		arr.push({ts: newts,
				data: randomNumberBounds(20,80)})
		ts = newts
    }
    bufferData = arr*/

    obj.addModule('scatterchart')
    obj.addModule('scatterchart')

    //obj.draw()
    //randomScatterValues()



    /* CONNECT WEBSOCKET */
    connect()
    d3.timer(obj.draw_update)
    //obj.draw_update()

});


function randomScatterValues(){
  var MAX_LENGTH = 50;
  if (scatterArr.length == 0){
    for(var i=0; i < MAX_LENGTH; i++){
      scatterArr.push([randomNumberBounds(0,100),randomNumberBounds(0,100),randomNumberBounds(0,10)])
    }
  }else{/*
    for(var i=0; i < scatterArr.length ; i++){
      scatterArr[i] = [randomNumberBounds(0,100),randomNumberBounds(0,100),randomNumberBounds(0,10)]
    }*/
    for(var i=0; i < MAX_LENGTH; i++){
      scatterArr.push([randomNumberBounds(0,100),randomNumberBounds(0,100),randomNumberBounds(0,10)])
    }
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

function barchartDemo(){
  incrementBarChart()
  obj.update()
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
