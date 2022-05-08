from pprint import pprint

boardWidth = 10
boardHeight = 10

class Ship():
  ships = {'carrier':5, 'battleship':4, 'cruiser':3, 'submarine':3, 'destroyer':2}
  def __init__(self, location = 0, type ='carrier', direction="horizontal", shipId = 0):
    self._loc = location
    self._len = self.ships[type]
    self.calculateOffset(direction)
    self.shipId = shipId
    if not self.checkValidLocation():
      raise ValueError('Out of bounds loc: ' + str(location) + ' in creation, ' 
        + str(self._len * self._offset + self._loc) + '<=' + str(boardWidth*boardHeight))
    self.assignCells(location)

  # Getter for ship length
  def get_len(self):
    return self._len

  def calculateOffset(self, direction):
    if direction == "horizontal":
      self._offset = 1
    else:
      self._offset = boardWidth

  def assignCells(self, location):
    self._cells = []
    for i in range(0, self._len):
      self._cells.append(self._loc + self._offset*i)

  #added remover to remove cell locations on ship
  def removeCells(self):
    print(self._cells)
    for i in range(0, self._len):
      self._cells.pop()

  def checkValidLocation(self):
    return (self._loc < boardWidth * boardHeight 
      and self._loc >= 0 
      and (((self._len + (self._loc % boardWidth) <= boardWidth) 
          and self._offset == 1) 
        or (((self._len-1) * self._offset + self._loc <= boardWidth*boardHeight) 
          and  self._offset == boardWidth)))

  def checkExists(self, location):
    return location in self._cells

  def hit(self, location):
    for i in range(0, len(self._cells)):
      if self._cells[i] == location:
        self._cells[i] = -1
        return True
    return False

  def dead(self):
    for cell in self._cells:
      if cell != -1:
        return False
    return True

  def collision(self, ship):
    for cell in self._cells:
      if ship.checkExists(cell):
        return True
    return False


class Carrier(Ship):
  def __init__(self):
    self.special = True
    super(Carrier, self).__init__()

  def checkAddSpecial(self, turns):
    if turns % 5 == 0:
      self.special = True


class BattleshipGame():
  # Change from number of ships to budget
  shipMaxSpaceCount = 17
  def __init__(self, player_id = "1"):
    self.current_player = 1
    self.players={}
    self.players[player_id] = 1
    self.player1 = []
    self.player2 = []
    self.player1_ready = False;
    self.player2_ready = False;
    self.player1_timeouts = {'bomb':0, 'strafe':0, 'mine':0}
    self.player2_timeouts = {'bomb':0, 'strafe':0, 'mine':0}

  def addPlayer(self, player_id = "2"):
    self.players[player_id] = player_id

  def addShip(self, player_id, ship):
    # Get the current player ship list
    player = self.getPlayer(player_id)
    
    # Get the current budget in the ship list
    spent = 0
    for p in player:
      spent += p.get_len()
    
    # Check if ship can be placed
    if (not self.checkIfColliding(player, ship)
      and (spent + ship.get_len()) <= self.shipMaxSpaceCount):
      player.append(ship)
      return True
    # If ship cannot be placed, give error message
    else:
      raise ValueError(f"Max Budget is: {str(self.shipMaxSpaceCount)}"
        + " Used budget is: {spent}. Adding the desired ship exceeds the max budget")

  #initiates shipremover
  def removeShip(self, player_id, shipId):
    # Get the current player ship list
    player = self.getPlayer(player_id)
    # Delete ship
    try:
      self.checkIfDeleted(player, shipId)
      return True
    # If ship does not exist, give error message
    except ValueError:
        print("Ship does not exist.")

  def checkIfColliding(self, player, ship):
    for existingShip in player:
      if ship.collision(existingShip):
        raise ValueError('Collision with existing ship')
    return False

  #loops through players ships and selects the one
  #that has the id of the passed variable
  #removes the ship from player list
  def checkIfDeleted(self, player, shipId):
    for ship in player[:]:
      if int(ship.shipId) == int(shipId):
        ship.removeCells()
        player.remove(ship)

  def checkGameOver(self, player_id):
    player = self.getPlayer(player_id)
    for ship in player:
      if not ship.dead():
        return False
    return True

  def fire(self, locations, more=False):
    hit = False
    enemy_player = (~self.current_player) & 3
    for ship in self.getPlayer(enemy_player):
      for location in locations:
        if ship.hit(location):
          hit = True
    if not more:
      self.current_player = enemy_player
    return hit

  def getPlayer(self, player_id):
    if player_id == 1:
      return self.player1
    else:
      return self.player2

  def ready(self, player_id):
    if player_id == 1:
      self.player1_ready = True;
    else:
      self.player2_ready = True;
