$(document).ready(function() {

    //if hover brick visible and click outside board
    //make all bricks invis
    $(document).mouseup(function(e){
        var container = $('.board');

        if(!container.is(e.target) && container.has(e.target).length === 0){
            $('.carrierhover').css({'visibility':'hidden'});
            $('.battleshiphover').css({'visibility':'hidden'});
            $('.cruiserhover').css({'visibility':'hidden'});
            $('.submarinehover').css({'visibility':'hidden'});
            $('.destroyerhover').css({'visibility':'hidden'});
            ship = null;
        }
    });
    //has all ships follow mouse
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

//on click of buttons set shiphover css to visible and
//rest to invisible
  $('.button1').on('click', function() {
    ship = "Carrier"
    $('.carrierhover').css({'visibility':'visible'});
     $('.battleshiphover').css({'visibility':'hidden'});
     $('.cruiserhover').css({'visibility':'hidden'});
     $('.submarinehover').css({'visibility':'hidden'});
     $('.destroyerhover').css({'visibility':'hidden'});
    $('.bottom').on('click', function(){
        $('.carrierhover').css({'visibility':'hidden'});
        ship = null;
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
        ship = null;
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
        ship = null;
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
        ship = null;
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
        ship = null;
    });
  });
  //on click of vert/horz button change ship hover size
  $('.orientation').on('click', function() {
    direction = $(".orientation").text();
    if (direction == "Horizontal"){
      $('.orientation').text("Vertical");
      active_orientation = "vert"
      $('.carrierhover').css({
      'width':'29px',
      'height':'145px'
      });
      $('.battleshiphover').css({
      'width':'29px',
      'height':'116px'
      });
      $('.cruiserhover').css({
      'width':'29px',
      'height':'87px'
      });
      $('.submarinehover').css({
      'width':'29px',
      'height':'87px'
      });
      $('.destroyerhover').css({
      'width':'29px',
      'height':'58px'
      });
    }
    else if (direction == "Vertical"){
      $('.orientation').text("Horizontal");
      active_orientation = "horz"
      $('.carrierhover').css({
      'width':'145px',
      'height':'29px'
      });
      $('.battleshiphover').css({
      'width':'116px',
      'height':'29px'
      });
      $('.cruiserhover').css({
      'width':'87px',
      'height':'29px'
      });
      $('.submarinehover').css({
      'width':'87px',
      'height':'29px'
      });
      $('.destroyerhover').css({
      'width':'58px',
      'height':'29px'
      });
    }
  });
  //on click ready
  $('.button-ready').on('click', function() {
    sendReady();
  });
  $('.abutton1').on('click', function() {
    shot_type = "normal";
    $('.abutton1').css({'background-color':'#8E0404'});
    $('.abutton2').css({'background-color':'#e94B3cff'});
    $('.abutton3').css({'background-color':'#e94B3cff'});
    $('.abutton4').css({'background-color':'#e94B3cff'});
    $('.abutton5').css({'background-color':'#e94B3cff'});
  });
  $('.abutton2').on('click', function() {
    shot_type = "bomb";
    $('.abutton1').css({'background-color':'#e94B3cff'});
    $('.abutton2').css({'background-color':'#8E0404'});
    $('.abutton3').css({'background-color':'#e94B3cff'});
    $('.abutton4').css({'background-color':'#e94B3cff'});
    $('.abutton5').css({'background-color':'#e94B3cff'});
  });
  $('.abutton3').on('click', function() {
    shot_type = "strafe";
    $('.abutton1').css({'background-color':'#e94B3cff'});
    $('.abutton2').css({'background-color':'#e94B3cff'});
    $('.abutton3').css({'background-color':'#8E0404'});
    $('.abutton4').css({'background-color':'#e94B3cff'});
    $('.abutton5').css({'background-color':'#e94B3cff'});
  });
  $('.abutton4').on('click', function() {
    shot_type = "mine";
    $('.abutton1').css({'background-color':'#e94B3cff'});
    $('.abutton2').css({'background-color':'#e94B3cff'});
    $('.abutton3').css({'background-color':'#e94B3cff'});
    $('.abutton4').css({'background-color':'#8E0404'});
    $('.abutton5').css({'background-color':'#e94B3cff'});
  });
  $('.abutton5').on('click', function() {
    $('.abutton1').css({'background-color':'#e94B3cff'});
    $('.abutton2').css({'background-color':'#e94B3cff'});
    $('.abutton3').css({'background-color':'#e94B3cff'});
    $('.abutton4').css({'background-color':'#e94B3cff'});
    $('.abutton5').css({'background-color':'#8E0404'});
  });

});