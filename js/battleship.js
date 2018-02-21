
var socket;

var active_orientation = "horz";
var phase = "placement";
ships = {
  "Carrier": 5, 
  "Battleship":4, 
  "Cruiser":3, 
  "Submarine":3, 
  "Destroyer":2
};

$(document).ready(function() {

  socket = io.connect( 'http://' + document.domain + ':' + location.port );

  for (var i = 1; i <= 100; i++) {
    // The number and letter designators
    if (i < 11) {
      $(".top").prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
      $(".bottom").prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
      $(".grid").append("<li class='points offset1 " + i + "'><span class='hole'></span></li>");
    } else {
      $(".grid").append("<li class='points offset2 " + i + "'><span class='hole'></span></li>");
    }
    if (i == 11) {
      $(".top").prepend("<span class='aTops' style='color:red;'>E</span>");
      $(".bottom").prepend("<span class='aTops' style='color:blue;'>P</span>");
    }
    if (i > 90) {
      $(".top").append("<span class='aLeft'>" + 
                String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
      $(".bottom").append("<span class='aLeft'>" + 
                String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
    }
  };
  
  socket.on('connect', function() {
  });

  socket.on('message', function(msg) {
    console.log(msg);
    if (msg.type == "chat"){
      $("#messages").append('<li><b>'+msg.name+':</b> '+msg.message+'</li>');
      $(".chat-text").scollTop=1;
    }
    else if (msg.type == "place-ship"){
      placeShip(Number(msg.location), Number(msg.length), msg.direction, msg.ship);
    }
  });


  $('#sendbutton').on('click', function() {
    sendChatMessage();
  });
  $("#message").on('keyup', function (e) {
    if (e.keyCode == 13) {
      sendChatMessage();
    }
  });

  $('.ship').on('click', function() {
    ship = $(".ship").text();
    if (ship == "Carrier")
       $('.ship').text("Battleship");
    else if (ship == "Battleship")
       $('.ship').text("Cruiser");
    else if (ship == "Cruiser")
       $('.ship').text("Submarine");
    else if (ship == "Submarine")
       $('.ship').text("Destroyer");
    else if (ship == "Destroyer")
       $('.ship').text("Carrier");
  });

  $('.orientation').on('click', function() {
    direction = $(".orientation").text();
    if (direction == "Horizontal"){
      $('.orientation').text("Vertical");
      active_orientation = "vert"
    }
    else if (direction == "Vertical"){
      $('.orientation').text("Horizontal");
      active_orientation = "horz"
    }
  });

  $(".top").find(".points").off("mouseenter mouseover").on("mouseenter mouseover", function() {
    // only allow target highlight on none attempts
    if(!($(this).hasClass("used"))) enemyBoard.highlight(this);
  });

  $(".bottom").find(".points").off("mouseenter").on("mouseenter", function() {
    var num = $(this).attr('class').slice(15);
    ship_len = ships[$(".ship").text()];

    if (active_orientation == "horz") displayShipHorz(parseInt(num), ship_len, this);
    else displayShipVert(parseInt(num), ship_len, this);
  });
});

var enemyBoard = {
  allHits: [],
  highlight: function(square) {
    $(square).addClass("target").off("mouseleave").on("mouseleave", function() {
      $(this).removeClass("target"); 
    });

    $(square).off("click").on("click", function() {
      if(!($(this).hasClass("used"))) {
        if (my_turn == true){
          $(this).removeClass("target").addClass("used");
        }
        var num = parseInt($(this).attr("class").slice(15));
        var bool = enemyFleet.checkIfHit(num);
        if (false == bool) {
          $(".text").text(output.miss("You"));
          $(this).children().addClass("miss");
        } else $(this).children().addClass("hit");
        $(".top").find(".points").off("mouseenter").off("mouseover").off("mouseleave").off("click");
      } 
    });
  },
}

function placeShip(location, length, direction, ship) {
  if (direction == "horizontal"){
    for (var i = location; i < (location + length); i++) {
      console.log(i, location+length)
      $(".bottom ." + i).addClass(ship);
      $(".bottom ." + i).children().removeClass("hole");
    }
  } else {

  }
};

function displayShipHorz(location, length, point) {
  var endPoint = location + length - 2;
  if (!(endPoint % 10 >= 0 && endPoint % 10 < length - 1)) {
    for (var i = location; i < (location + length); i++) {
      $(".bottom ." + i).addClass("highlight");
    }
    $(point).off("click").on("click", function() {
      sendShip(location);
    });
  }
  $(point).off("mouseleave").on("mouseleave", function() {
    removeShipHorz(location, length);
  });
}

function removeShipHorz(location, length) {
  for (var i = location; i < location + length; i++) {
    $(".bottom ." + i).removeClass("highlight");
  }
}


function displayShipVert(location, length, point) {
  var endPoint = (length * 10) - 10;
  var inc = 0; 
  if (location + endPoint <= 100) {
    for (var i = location; i < (location + length); i++) {
      $(".bottom ." + (location + inc)).addClass("highlight");
      inc = inc + 10;
    }
    $(point).off("click").on("click", function() {
      sendShip(location);
    });
  }
  $(point).off("mouseleave").on("mouseleave", function() {
    removeShipVert(location, length);
  });
}

function removeShipVert(location, length) {
  var inc = 0;
  for (var i = location; i < location + length; i++) {
    $(".bottom ." + (location + inc)).removeClass("highlight");
    inc = inc + 10;
  }
}



function sendChatMessage(){
  socket.send({
    name: $('#name').val(),
    message:$('#message').val(),
    type:"chat"
  });
  $('#message').val("");
};

function sendShip(location){
  socket.send({
    location: String(location),
    ship: $('.ship').text().toLowerCase(),
    direction: $('.orientation').text().toLowerCase(),
    length: ships[$('.ship').text()],
    type:"place-ship"
  });

}
