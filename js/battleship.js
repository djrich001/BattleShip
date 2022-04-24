
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
var budget = 0;
ships = {
  "Carrier": 5, 
  "Battleship":4, 
  "Cruiser":3, 
  "Submarine":3, 
  "Destroyer":2
};

$(document).ready(function() {

    socket = io.connect( 'http://' + document.domain + ':' + location.port);

    //loops through both boards setting up the hole classes
    //and the alphabet and digits
    for (var i = 1; i <= 100; i++) {
        if (i < 11) {
            $(".top").prepend("<span class='aTops-top'>" + Math.abs(i - 11) + "</span>");
            $(".bottom").prepend("<span class='aTops-bottom'>" + Math.abs(i - 11) + "</span>");
            $(".grid-top").append("<li class='points-top offset1 " + i + "'><span class='hole'></li>");
            $(".grid-bottom").append("<li class='points-bottom offset1 " + i + "'><span class='hole'></li>");
        } else {
            $(".grid-top").append("<li class='points-top offset2 " + i + "'><span class='hole'></li>");
            $(".grid-bottom").append("<li class='points-bottom offset2 " + i + "'><span class='hole'></li>");
        }
        if (i == 11) {
            $(".top").prepend("<span class='aTops-top' style='color:red;'>E</span>");
            $(".bottom").prepend("<span class='aTops-bottom' style='color:blue;'>P</span>");
        }
        if (i > 90) {
            $(".top").append("<span class='aLeft-top'>" +
                String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
            $(".bottom").append("<span class='aLeft-bottom'>" +
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
        else if (msg.type == "room-join" && phase == "placement"){
            room = msg.room;
            player_no = Number(msg.number);
            $(".playerno").text("PNum:" + String(player_no));
            $(".gameid").text("Game id: " + room.substr(0,12));
        }
        else if (msg.type == "place-ship" && phase == "placement"){
            placeShip(Number(msg.location)+1, Number(msg.length), msg.direction, msg.ship);
            $('.budget-brick').text("Ship Budget: " + budget + "/17");
        }
        else if (msg.type == "delete-ship" && phase == "placement"){
        }
        else if (msg.type == "alert"){
            $(".text").text(msg.message);
        }
        else if (msg.type == "game-begun"){
            phase = "firing";
            turn = 1;
           // window.location.href = "battleship.html";
           // changeBoardSize();
        }
        else if (msg.type == "fire" && phase == "firing"){
            turn = 3-msg.player_no;
            hit = msg.hit ? "hit" : "miss";
            board = (msg.player_no == player_no) ? ".top" : ".bottom";
            for (i = 0; i < msg.locations.length; i++){
                loc = msg.locations[i] + 1
                //adds red dot to hole class (default white)
                $(board).find("."+(loc)).children().addClass(hit);
                //sets the hole class to visible to make the attacks visible
                $(board).find("."+(loc)).children().css({'visibility':'visible'});
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
        changeBoardSize();
    });
    $("#message").on('keyup', function (e) {
        if (e.keyCode == 13) {
            sendChatMessage();
        }
    });

    //on enter into enemy board trigger highlight of square
    $(".top").find(".points-top").off("mouseenter mouseover").on("mouseenter mouseover", function() {
        if(!($(this).hasClass("used")) && phase == "firing") enemyBoard.highlight(this);
    });

    //on enter into your board trigger delete ship, hightlight vert or horz
    $(".bottom").find(".points-bottom").off("mouseenter").on("mouseenter", function() {
        var num = $(this).attr('class').slice(22);
        ship_len = ships[ship];
        //if no ship selected: initiate delete ship on clicked ship
        if (ship == null){
            deleteShipClient(parseInt(num), this);
        }
        //highlight horz
        else if (active_orientation == "horz") displayShipHorz(parseInt(num), ship_len, this);
        //highlight vert
        else displayShipVert(parseInt(num), ship_len, this);
    });
});

var enemyBoard = {
    allHits: [],
    highlight: function(square) {
        //on hover of enemy board add highlight
    if(!($(square).children().hasClass('hole hit'))){
        $(square).addClass("target").off("mouseleave").on("mouseleave", function() {
            $(this).removeClass("target");
        });
    }
        //on click trigger fire (sends msg to main.py)
        $(square).off("click").on("click", function() {
            if(!($(this).children().hasClass("hole hit"))) {
                var num = parseInt($(this).attr("class").slice(22));
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

//after msg sent add ship on html page
function placeShip(location, length, direction, ship) {
    if (phase == "placement"){
        budget += parseInt(length);
        console.log(budget)
        if (direction == "horizontal"){
            for (var i = location; i < (location + length); i++) {
                $(".bottom ." + i).addClass(ship).attr("id",shipCounter);
            }
        } else {
            var inc = 0;
            for (var i = location; i < (location + length); i++) {
                $(".bottom ." + (location + inc)).addClass(ship).attr("id",shipCounter);
                inc = inc + boardWidth;
            }
        }
    }
};

//highlight on board horz
function displayShipHorz(location, length, point) {
    if (phase == "placement"){
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
            var locationMod = location - 1;
            var endPoint = location + length - 3;
        }
        if (!(endPoint % boardWidth >= 0 && endPoint % boardWidth < length - 1)) {
            for (var i = locationMod; i < (locationMod + length); i++) {
                $(".bottom ." + i).addClass("highlight");
            }
            $(point).off("click").on("click", function() {
                shipCounter++;
                sendShip(locationMod);
            });
        }
        $(point).off("mouseleave").on("mouseleave", function() {
            removeShipHorz(locationMod, length);
        });
    }
}

//remove horz highlight on leave
function removeShipHorz(location, length) {
    if (phase == "placement"){
        for (var i = location; i < location + length; i++) {
            $(".bottom ." + i).removeClass("highlight");
        }
    }
}

//highlight ship on vert
function displayShipVert(location, length, point) {
    if (phase == "placement"){
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
        //if ship is destroyer
        if (length == 2){
            var locationMod = location - 10;
        }
        var endPoint = (length * boardWidth) - boardWidth;
        var inc = 0;
        if (locationMod + endPoint <= 100 && locationMod > 0) {
            for (var i = locationMod; i < (locationMod + length); i++) {
                $(".bottom ." + (locationMod + inc)).addClass("highlight");
                inc = inc + boardWidth;
            }
            $(point).off("click").on("click", function() {
                shipCounter++;
                sendShip(locationMod);
            });
        }
        $(point).off("mouseleave").on("mouseleave", function() {
            removeShipVert(locationMod, length);
        });
    }
}

//remove vert highlight on leave
function removeShipVert(location, length) {
    if (phase == "placement"){
        var inc = 0;
        for (var i = location; i < location + length; i++) {
            $(".bottom ." + (location + inc)).removeClass("highlight");
            inc = inc + 10;
        }
    }
}

//begins the process for deleting ship on the gui
//once the gui is cleared, send delete msg to main.py
function deleteShipClient(location, point){
    if (phase == "placement"){
        var getId = $('.bottom .' + location).attr('id');
        if(!(getId == undefined)){
            var getClass = ($('.bottom .' + location).attr('class')).split(" ");
            var getShipName = getClass[getClass.length - 1];
            var passShipBudget = getShipName.charAt(0).toUpperCase() + getShipName.slice(1)

            $(point).off("click").on("click", function() {
                for(var i = 0; i < 100; i++){
                    $('.bottom .' + i + '[id=' + getId + ']').removeClass(getShipName).removeAttr("id");
                }
                deleteShipServer(getId)
                budget -= ships[passShipBudget];
                $('.budget-brick').text("Ship Budget: " + budget + "/17");
                // might return later - trying to make deleting a ship look like picking it up
                //      ship = getShipName.charAt(0).toUpperCase() + getShipName.slice(1)
                //      $('.carrierhover').css({'visibility':'visible'});
                //      console.log(ship)
            });
        }
    }
}

function sendChatMessage(){
    socket.send({
        name: "Player: " + player_no,
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
        id: player_id,
        shipId: shipCounter
    });
}

//delete data sent to main.py
function deleteShipServer(getId){
    socket.send({
        type:"delete-ship",
        id: player_id,
        shipId: getId
    });
}

function sendReady(){
    socket.send({
        type:"ready-up",
        id: player_id
    });
}

function fire(location) {
    if (phase == "firing"){
        socket.send({
            type:"fire",
            shot:shot_type,
            location: String(location - 1),
            id:player_id
        });
    }
}

function changeBoardSize(){
    $('.bottom').css({
        'width':'330px',
        'height':'330px',
        });
    $('.grid-bottom').css({
        'width':'300px',
        'height':'300px',
        'margin-left': '30px'
    });
    $('.aTops-bottom').css({
        'width':'29px',
        'height':'29px'
    });
    $('.aLeft-bottom').css({
        'width':'29px',
        'height':'29px',
        'line-height':'29px'
    });
    $('.points-bottom').css({
        'width':'29px',
        'height':'29px'
    });
}
