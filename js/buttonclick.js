$(document).ready(function() {

      $(document).mousemove(function(e){
        $('.carrierhover').css({
          left: e.pageX,
          top:  e.pageY
        });
      });
      $(document).mousemove(function(e){
        $('.battleshiphover').css({
          left: e.pageX,
          top:  e.pageY
        });
      });
      $(document).mousemove(function(e){
        $('.cruiserhover').css({
          left: e.pageX,
          top:  e.pageY
        });
      });
      $(document).mousemove(function(e){
        $('.submarinehover').css({
          left: e.pageX,
          top:  e.pageY
        });
      });
      $(document).mousemove(function(e){
        $('.destroyerhover').css({
          left: e.pageX,
          top:  e.pageY
        });
      });

  $('.button1').on('click', function() {
    ship = "Carrier"
    $('.carrierhover').css({'visibility':'visible'});
     $('.battleshiphover').css({'visibility':'hidden'});
     $('.cruiserhover').css({'visibility':'hidden'});
     $('.submarinehover').css({'visibility':'hidden'});
     $('.destroyerhover').css({'visibility':'hidden'});
    $('.bottom').on('click', function(){
        $('.carrierhover').css({'visibility':'hidden'});
    });
  });
  $('.button2').on('click', function() {
    ship = "Battleship"
    $('.battleshiphover').css({'visibility':'visible'});
     $('.carrierhover').css({'visibility':'hidden'});
     $('.cruiserhover').css({'visibility':'hidden'});
     $('.submarinehover').css({'visibility':'hidden'});
     $('.destroyerhover').css({'visibility':'hidden'});
    $('.bottom').on('click', function(){
        $('.battleshiphover').css({'visibility':'hidden'});
    });
  });
  $('.button3').on('click', function() {
    ship = "Cruiser"
    $('.cruiserhover').css({'visibility':'visible'});
     $('.carrierhover').css({'visibility':'hidden'});
     $('.battleshiphover').css({'visibility':'hidden'});
     $('.submarinehover').css({'visibility':'hidden'});
     $('.destroyerhover').css({'visibility':'hidden'});
    $('.bottom').on('click', function(){
        $('.cruiserhover').css({'visibility':'hidden'});
    });
  });
  $('.button4').on('click', function() {
    ship = "Submarine"
    $('.submarinehover').css({'visibility':'visible'});
     $('.carrierhover').css({'visibility':'hidden'});
     $('.battleshiphover').css({'visibility':'hidden'});
     $('.cruiserhover').css({'visibility':'hidden'});
     $('.destroyerhover').css({'visibility':'hidden'});
    $('.bottom').on('click', function(){
        $('.submarinehover').css({'visibility':'hidden'});
    });
  });
  $('.button5').on('click', function() {
    ship = "Destroyer"
    $('.destroyerhover').css({'visibility':'visible'});
     $('.carrierhover').css({'visibility':'hidden'});
     $('.battleshiphover').css({'visibility':'hidden'});
     $('.cruiserhover').css({'visibility':'hidden'});
     $('.submarinehover').css({'visibility':'hidden'});
    $('.bottom').on('click', function(){
        $('.destroyerhover').css({'visibility':'hidden'});
    });
  });
  $('.orientation').on('click', function() {
    direction = $(".orientation").text();
    if (direction == "Horizontal"){
      $('.orientation').text("Vertical");
      active_orientation = "vert"
      $('.carrierhover').css({
      'width':'29px',
      'height':'145px',
      'transform': 'translate(0%,5%)'
      });
      $('.battleshiphover').css({
      'width':'29px',
      'height':'116px',
      'transform': 'translate(0%,10%)'
      });
      $('.cruiserhover').css({
      'width':'29px',
      'height':'87px',
      'transform': 'translate(0%,10%)'
      });
      $('.submarinehover').css({
      'width':'29px',
      'height':'87px',
      'transform': 'translate(0%,10%)'
      });
      $('.destroyerhover').css({
      'width':'29px',
      'height':'58px',
      'transform': 'translate(0%,10%)'
      });
    }
    else if (direction == "Vertical"){
      $('.orientation').text("Horizontal");
      active_orientation = "horz"
      $('.carrierhover').css({
      'width':'145px',
      'height':'29px',
      'transform': 'translate(0%,-105%)'
      });
      $('.battleshiphover').css({
      'width':'116px',
      'height':'29px',
      'transform': 'translate(0%,-105%)'
      });
      $('.cruiserhover').css({
      'width':'87px',
      'height':'29px',
      'transform': 'translate(0%,-105%)'
      });
      $('.submarinehover').css({
      'width':'87px',
      'height':'29px',
      'transform': 'translate(0%,-105%)'
      });
      $('.destroyerhover').css({
      'width':'58px',
      'height':'29px',
      'transform': 'translate(0%,-105%)'
      });
    }
  });
});