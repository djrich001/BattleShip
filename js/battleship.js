
var socket;
var turn;
var room;

var player_id = Math.random().toString(36).substring(2);
var player_no = 0;
var shot_type = "normal";
var boardWidth = 10; // Not currently a proper way to designate width.
var active_orientation = "horz";
var phase = "placement";
var ship = null;
var shipCounter = 0;
ships = {
  "Carrier": 5, 
  "Battleship":4, 
  "Cruiser":3, 
  "Submarine":3, 
  "Destroyer":2
};

$(document).ready(function() {

  socket = io.connect( 'http://' + document.domain + ':' + location.port);

  for (var i = 1; i <= 100; i++) {
    if (i < 11) {
      $(".top").prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
      $(".bottom").prepend("<span class='aTops'>" + Math.abs(i - 11) + "</span>");
      $(".grid").append("<li class='points offset1 " + i + "'></li>");
    } else {
      $(".grid").append("<li class='points offset2 " + i + "'></li>");
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
    $(".text").text("Welcome, to Battleship!");
    socket.send({"type":"hand-shake", "id":player_id})
  });

  // Message Handler -----------------------------------------------------------
  socket.on('message', function(msg) {
    console.log(msg);
    if (msg.type == "chat"){
      $("#messages").append('<li><b>'+msg.name+':</b> '+msg.message+'</li>');
      $(".chat-text").scollTop=1;
    }
    else if (msg.type == "room-join"){
      room = msg.room;
      player_no = Number(msg.number);
      $(".playerno").text("PNum:" + String(player_no));
      $(".gameid").text("Game id: " + room.substr(0,12));
    }
    else if (msg.type == "place-ship"){
      placeShip(Number(msg.location)+1, Number(msg.length), msg.direction, msg.ship);
    }
    else if (msg.type == "alert"){
      $(".text").text(msg.message);
    }
    else if (msg.type == "game-begun"){
      phase = "firing";
      turn = 1;
    }
    else if (msg.type == "fire"){
      turn = 3-msg.player_no;
      hit = msg.hit ? "hit" : "miss";
      board = (msg.player_no == player_no) ? ".top" : ".bottom";
      for (i = 0; i < msg.locations.length; i++){
        loc = msg.locations[i] + 1
        $(board).find("."+(loc)).children().addClass(hit);
        console.log("here:"+loc)
        console.log($(board).find(String(loc)).children());
      }
      $(".text").text("Player " + String(msg.player_no) + " fired " + msg.shot
        + " shot at location " + String(msg.locations[0]+1) + ", " + hit + "!");
    }
    else if (msg.type == "game_over"){
      phase = "game_over"
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

  $(".top").find(".points").off("mouseenter mouseover").on("mouseenter mouseover", function() {
    if(!($(this).hasClass("used")) && phase == "firing") enemyBoard.highlight(this);
  });

  $(".bottom").find(".points").off("mouseenter").on("mouseenter", function() {
    var num = $(this).attr('class').slice(15);
    ship_len = ships[ship];
    if (ship == null){
        deleteShip(parseInt(num), this);
    }
    else if (active_orientation == "horz") displayShipHorz(parseInt(num), ship_len, this);
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
        // $(this).removeClass("target").addClass("used");
        var num = parseInt($(this).attr("class").slice(15));
        fire(num);

        //if (false == bool) {
          //$(".text").text(output.miss("You"));
          //$(this).children().addClass("miss");
        //} else $(this).children().addClass("hit");
        //$(".top").find(".points").off("mouseenter").off("mouseover").off("mouseleave").off("click");
      } 
    });
  },
}

function placeShip(location, length, direction, ship) {
  if (direction == "horizontal"){
    for (var i = location; i < (location + length); i++) {
      $(".bottom ." + i).addClass(ship).attr("id",shipCounter);
    }
    shipCounter++;
  } else {
    var inc = 0;
    for (var i = location; i < (location + length); i++) {
      $(".bottom ." + (location + inc)).addClass(ship).attr("id",shipCounter);
      inc = inc + boardWidth;
    }
    shipCounter++;
  }
};

function displayShipHorz(location, length, point) {
//if ship is carrier
  if (length == 5){
    var locationMod = location - 2;
    var endPoint = location + length - 4;
  }
//if ship is battleship
  if (length == 4){
    var locationMod = location - 1;
    var endPoint = location + length - 3;
  }
//if ship is cruiser / submarine
  if (length == 3){
    var locationMod = location - 1;
    var endPoint = location + length - 3;
  }
//if ship is destroyer
  if (length == 2){
    var locationMod = location;
    var endPoint = location + length - 3;
  }
  if (!(endPoint % boardWidth >= 0 && endPoint % boardWidth < length - 1)) {
    for (var i = locationMod; i < (locationMod + length); i++) {
      $(".bottom ." + i).addClass("highlight");
    }
    $(point).off("click").on("click", function() {
      sendShip(locationMod);
    });
  }
  $(point).off("mouseleave").on("mouseleave", function() {
    removeShipHorz(locationMod, length);
  });
}

function removeShipHorz(location, length) {
  for (var i = location; i < location + length; i++) {
    $(".bottom ." + i).removeClass("highlight");
  }
  $(point).off("click").on("click", function() {
      deleteShip(location);
  });
}


function displayShipVert(location, length, point) {
//if ship is carrier
  if (length == 5){
    var locationMod = location - 20;
  }
//if ship is battleship
  if (length == 4){
    var locationMod = location - 10;
  }
//if ship is cruiser / submarine
  if (length == 3){
    var locationMod = location - 10;
  }
//if ship is cruiser / submarine
  if (length == 2){
    var locationMod = location;
  }
  var endPoint = (length * boardWidth) - boardWidth;
  var inc = 0;
  if (locationMod + endPoint <= 100 && locationMod > 0) {
    for (var i = locationMod; i < (locationMod + length); i++) {
      $(".bottom ." + (locationMod + inc)).addClass("highlight");
      inc = inc + boardWidth;
    }
    $(point).off("click").on("click", function() {
      sendShip(locationMod);
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
  $(point).off("click").on("click", function() {
      deleteShip(locationMod);
  });
}

function deleteShip(location, point){
   var getId = $('.bottom .' + location).attr('id');
   var getClass = ($('.bottom .' + location).attr('class')).split(" ");
   var getShipName = getClass[getClass.length - 1];

    $(point).off("click").on("click", function() {
      for(var i = 0; i < 100; i++){
        $('.bottom .' + i).attr('id',getId).removeClass(getShipName);
      }
      // might return later - trying to make deleting a ship look like picking it up
//      ship = getShipName.charAt(0).toUpperCase() + getShipName.slice(1)
//      $('.carrierhover').css({'visibility':'visible'});
//      console.log(ship)
    });
    deleteShipServer(location)
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
    type:"place-ship",
    location: String(location - 1),
    ship: ship.toLowerCase(),
    direction: $('.orientation').text().toLowerCase(),
    length: ships[ship],
    id: player_id
  });
}

function deleteShipServer(location){
  socket.send({
    type:"delete-ship",
    location: String(location - 1),
    ship: ship.toLowerCase(),
    direction: $('.orientation').text().toLowerCase(),
    length: ships[ship],
    id: player_id
  });
}

function fire(location) {
  if (phase == "firing")
    socket.send({
      type:"fire",
      shot:shot_type,
      location: String(location - 1),
      id:player_id
    });
}
