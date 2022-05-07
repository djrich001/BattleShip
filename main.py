"""Main file to run the Battleship game
   sets up the flask server and links in
   the needed files."""

from flask import Flask, render_template, send_from_directory, redirect, url_for
from flask_socketio import SocketIO, send, emit
from flask_socketio import join_room, leave_room
from datetime import time
from uuid import uuid4
from pprint import pprint

import unittest

from battleship import Ship
from battleship import BattleshipGame

# Global variables
debug = True
app = Flask(__name__, template_folder="templates")
app.config['SECRET_KEY'] = 'GreatBigSecret'
socketio = SocketIO(app,cors_allowed_origins = '*') # cors_allowed_origins set to * to allow access from any IP
message_history = []
games = {}
players = {}
player_numbers = {}
player_ships = {}
game_over = False
# Hold previous shots
player1_old_shots = []
player2_old_shots = []

@app.route('/css/<path:path>', methods=['GET'])
def send_css(path):
    """Function to load style sheet to adjust look of game"""
    return send_from_directory('css',path)

@app.route('/js/<path:path>', methods=['GET'])
def send_js(path):
    """Function to attach javascript function to program."""
    return send_from_directory('js',path)

@app.route('/')
def index():
    """Function to establish index.html as the main page template for Battleship"""
    return render_template("./index.html")

@socketio.on('join')
def handleJoin(data):
    """Function to print data upon player joining"""
    print("joined " + str(data))

@socketio.on('connect')
def handleConnection():
    """Function to show connection of a new player"""
    for msg in message_history:
        send(msg)
    send({"type":"chat", "name":"Server", "message":"New Player Connected"}, 
         broadcast=True)

@socketio.on('message')
def handleMessage(msg):
    """Function to determine the type of message and send it to the appropriate function"""
    if check_valid_chat(msg):
        handle_chat(msg)
    elif (msg["type"] == "place-ship"):
        handle_place_ship(msg)
    elif (msg["type"] == "delete-ship"):
        handle_delete_ship(msg)
    elif (msg["type"] == "hand-shake"):
        handle_hand_shake(msg)
    elif (msg["type"] == "ready-up"):
        handle_ready(msg)
    elif (msg["type"] == "fire"):
        handle_fire(msg)
    print(msg)

def check_valid_chat(msg):
    """Function to check the validity of a chat message."""
    if "name" in msg and "message" in msg and "type" in msg:
        return (msg["type"] == "chat" and "message" in msg 
                and msg["message"] != "" and len(msg["message"]) < 120
                and len(msg["name"]) <= 12 and len(msg["name"]) > 0 ) 

def handle_chat(msg):
    """Function to handle the sending of chat messages"""
    send(msg, broadcast=True)
    message_history.append({"name":msg["name"], "message":msg["message"], 
                           "type":"chat"})

def handle_place_ship(msg):
    """Function to handle the placement of ships on the board
       - changed to allow user to choose ships as they desire."""
    try:
        # Get the player information based on input parameters
        player_id = msg["id"]
        player_no = player_numbers[player_id]
        game = games[players[player_id]]
        ship = Ship(int(msg["location"]), type=msg["ship"], 
                    direction=msg["direction"], shipId=msg["shipId"])
        # Add the ship to the game instance under the appropriate player
        game.addShip(player_no, ship)
    except ValueError as e:
        send_alert(str(e))
    else: # If no exceptions arise, check if all ships have been placed
        alert_ship_placement(msg)
        send(msg)
       # if game.ready():
            #send_alert("All ships placed... Player 1 ready to fire!",
                       #players[player_id])
            #send({"type":"game-begun"},room=players[player_id])

def handle_ready(msg):
    player_id = msg["id"]
    player_no = player_numbers[player_id]
    game = games[players[player_id]]
    game.ready(player_no)

    if (game.player1_ready and game.player2_ready) == True:
        send({"type": "game-begun"}, room=players[player_id])

def handle_delete_ship(msg):
    """Function to handle the deletion of ships on the board."""
    try:
        # Get the player information based on input parameters
        player_id = msg["id"]
        player_no = player_numbers[player_id]
        game = games[players[player_id]]
#        ship =
        # Remove the ship from the game instance under the appropriate player
        game.removeShip(player_no, msg["shipId"])
    except ValueError as e:
        send_alert(str(e))

def handle_hand_shake(msg):
    """Function to get needed data from msg and send it to link a new player into a game"""
    players[msg["id"]] = get_a_game(msg["id"])
    player_ships[msg["id"]] = []
    send({"type":"room-join", "number":player_numbers[msg["id"]],
         "room":players[msg["id"]]})

def get_a_game(player_id):
    """Put players into a game. If a game is waiting for a player,
       put them in it. If all games are full, make a new game
       to put players in."""

    # Check if there is a game with only one player
    if len(players)%2 == 0:
        # Create new game
        game = str(uuid4().hex)
        # Add game to games list and instantiate it as a BattleshipGame
        games[game] = BattleshipGame()
        # Add the player to the new game
        player_numbers[player_id] = 1
        join_room(game)
        # Send message to player
        send_alert("New Game started waiting on player two.")
        return game
    else:
        # Search through current games for game that is not full
        seen_games = {}
        for (player, game) in players.items():
            # Check games by adding them to seen_games dictionary
            if game in seen_games:
                # If a game is seen twice, raise count to 2 for the second player
                seen_games[game]= seen_games[game] + 1
            else:
                # The first time a game is seen, set its value to 1 for the first player
                seen_games[game]=1
        # Loop through seen_games dictionary to find a game with a count of one
        for (game, count) in seen_games.items():
            # Check count
            if count == 1:
                # Add new player to waiting game
                player_numbers[player_id] = 2
                join_room(game)
                # Send message for joined game
                send_alert("Game ready, place ships!", game)
                return game

def send_shot(rm, player_no, locations, hit, shot):
    """Send a shot message to a specific game room"""
    send({"type":"fire", "shot":shot,"player_no":player_no,
        "locations":locations, "hit":hit}, room=rm)

def handle_fire(msg):
    """Function to handle the firing mechanism"""

    # Check if game is over
    global game_over
    if (game_over):
        player_id = msg["id"]
        send({"type":"game-over"})
        return

    try:
        player_id = msg["id"]
        player_no = player_numbers[player_id]
        game = games[players[player_id]]
        # Get the current player ship list
        player_ships = game.getPlayer(player_no)
        # Construct player shot availability
        shots = {'bomb': 0, 'strafe': 0, 'mine': 0}
        for ship in player_ships:
            if not ship.dead():
                if ship.get_len() == 5:
                    shots['bomb'] += 1
                elif ship.get_len() == 4:
                    shots['strafe'] += 1
                elif ship.get_len() == 3:
                    shots['mine'] += 1
        print(f"Player: {player_no} shots: {shots}")
        locations = [int(msg["location"])]
        hit = False
        if player_no == game.current_player:
            if msg["shot"] == "normal":
                # Set timeouts
                if player_no == 1:
                    game.player1_timeouts['bomb'] -= shots['bomb']
                    game.player1_timeouts['strafe'] -= shots['strafe']
                    game.player1_timeouts['mine'] -= shots['mine']
                    print(f"Player 1 abilities: {game.player1_timeouts}")
                elif player_no == 2:
                    game.player2_timeouts['bomb'] -= shots['bomb']
                    game.player2_timeouts['strafe'] -= shots['strafe']
                    game.player2_timeouts['mine'] -= shots['mine']
                    print(f"Player 2 abilities: {game.player2_timeouts}")
                # Add location to old shots
                check_locations(player_no, locations[0])
                # Shoot
                hit = game.fire([locations[0]])
                send_shot(players[player_id], player_no, locations,
                          hit, msg["shot"])
            elif msg["shot"] == "bomb":
                # Check if shot type is available
                if check_timeouts(game, player_no, 'bomb') and shots['bomb'] > 0:
                    # Set timeouts after checking them
                    if player_no == 1:
                        game.player1_timeouts['bomb'] = 5
                        game.player1_timeouts['strafe'] -= shots['strafe']
                        game.player1_timeouts['mine'] -= shots['mine']
                        print(f"Player 1 abilities: {game.player1_timeouts}")
                    elif player_no == 2:
                        game.player2_timeouts['bomb'] = 5
                        game.player2_timeouts['strafe'] -= shots['strafe']
                        game.player2_timeouts['mine'] -= shots['mine']
                        print(f"Player 2 abilities: {game.player2_timeouts}")
                    # Create list of locations to attack (Horizontal Row)
                    nums = []
                    location = locations[0]
                    location = location - (location % 10)
                    for i in range(location, location+10):
                        nums.append(i)
                    locations = nums
                    # Shoot at each location
                    for l in locations:
                        # Check if location has already been shot and add new shots to old shots
                        if check_locations(player_no, l):
                            hit = game.fire([l], more=(True if l != locations[-1] else False))
                            send_shot(players[player_id], player_no, [l],
                                      hit, msg["shot"])
                else:
                    # Tell player that ability is unavailable
                    send_alert("Bomb ability currently unavailable.")
            elif msg["shot"] == "strafe":
                # Check if shot type is available
                if check_timeouts(game, player_no, 'strafe') and shots['strafe'] > 0:
                    # Set timeouts after checking them
                    if player_no == 1:
                        game.player1_timeouts['bomb'] -= shots['bomb']
                        game.player1_timeouts['strafe'] = 5
                        game.player1_timeouts['mine'] -= shots['mine']
                        print(f"Player 1 abilities: {game.player1_timeouts}")
                    elif player_no == 2:
                        game.player2_timeouts['bomb'] -= shots['bomb']
                        game.player2_timeouts['strafe'] = 5
                        game.player2_timeouts['mine'] -= shots['mine']
                        print(f"Player 2 abilities: {game.player2_timeouts}")
                    # Create list of locations to attack (Vertical Column)
                    nums = []
                    location = locations[0] % 10
                    for i in range(10):
                        nums.append(10 * i + location)
                    locations = nums
                    # Shoot at each location
                    for l in locations:
                        # Check if location has already been shot and add new shots to old shots
                        if check_locations(player_no, l):
                            hit = game.fire([l], more=(True if l != locations[-1] else False))
                            send_shot(players[player_id], player_no, [l],
                                      hit, msg["shot"])
                else:
                    # Tell player that ability is unavailable
                    send_alert("Strafe ability currently unavailable.")
            elif msg["shot"] == "mine":
                # Check if shot type is available
                if check_timeouts(game, player_no, 'mine') and shots['mine'] > 0:
                    # Set timeouts after checking them
                    if player_no == 1:
                        game.player1_timeouts['bomb'] -= shots['bomb']
                        game.player1_timeouts['strafe'] -= shots['strafe']
                        game.player1_timeouts['mine'] = 5
                        print(f"Player 1 abilities: {game.player1_timeouts}")
                    elif player_no == 2:
                        game.player2_timeouts['bomb'] -= shots['bomb']
                        game.player2_timeouts['strafe'] -= shots['strafe']
                        game.player2_timeouts['mine'] = 5
                        print(f"Player 2 abilities: {game.player2_timeouts}")
                    # Create list of locations to attack (Square of 9 points)
                    nums = []
                    location = locations[0]
                    nums.append(location-11)
                    nums.append(location-10)
                    nums.append(location-9)
                    nums.append(location-1)
                    nums.append(location)
                    nums.append(location+1)
                    nums.append(location+9)
                    nums.append(location+10)
                    nums.append(location+11)
                    for num in nums:
                        if num < 0:
                            nums.remove(num)
                    locations = nums
                    # Shoot at each location
                    for l in locations:
                        # Check if location has already been shot and add new shots to old shots
                        if check_locations(player_no, l):
                            hit = game.fire([l], more=(True if l != locations[-1] else False))
                            send_shot(players[player_id], player_no, [l],
                                      hit, msg["shot"])
                else:
                    # Tell player that ability is unavailable
                    send_alert("Mine ability currently unavailable.")
            if game.checkGameOver(3-player_no):
                game_over = True
                send_alert("GAME OVER, PLAYER " + str(player_no)
                        + " WINS!!", players[player_id])
                send({"type":"game_over"})
        else:
            send_alert("Wait your turn!")
    except ValueError as e:
        send_alert(str(e))

def check_locations(player_no, location):
    """Function to check if a location has already been shot."""
    
    # Get the old shot lists
    global player1_old_shots
    global player2_old_shots
    
    if player_no == 1:
        # Check if shot in old shots
        if location in player1_old_shots:
            return False
        # Append location
        player1_old_shots.append(location)
        print(player1_old_shots)
    elif player_no == 2:
        # Check if shot in old shots
        if location in player2_old_shots:
            return False
        # Append location
        player2_old_shots.append(location)
        print(player2_old_shots)
    return True

def check_timeouts(game, player_id, shot_type):
    """Function to check whether or not an ability is available"""

    print(f"Player: {player_id}")
    # Get the timeout dictionary
    if player_id == 1:
        timeouts = game.player1_timeouts
        return game.player1_timeouts[shot_type] <= 0
    elif player_id == 2:
        timeouts = game.player2_timeouts
        return game.player2_timeouts[shot_type] <= 0

def alert_ship_placement(msg, rm=None):
    """Function to set and send ship placement"""
    x = (int(msg["location"]) % 10) + 1
    y = (int(msg["location"]) / 10) + 1
    send_alert(msg["ship"].title() + " placed. " 
        + msg["direction"].title() + ", at (" 
        + str(x) + "," + str(y) + ").", rm)

def send_alert(message, rm=None):
    """Function to send alert messages"""
    send({"type":"alert", "message":message}, room=rm)

# Denote program as a flask app - setting host to 0.0.0.0 opens the app to the local network.
# If program is run with python, it will use port 7000
# If run using flask command, port will be 5000 as native to flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7000, debug=True)
