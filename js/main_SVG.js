var lineArr = [], barArr = [], scatterArr = [] ;
seedBarChart()

$(document).ready(function(){
    width = $('.container').width()
    obj = new Chart(width, height, margin)

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

      obj.draw()
      $("#init_button").attr('disabled', true)
      $('.graph_init input').attr('disabled', true)
      $('select').attr('disabled',true)

    })



});
