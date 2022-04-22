import unittest
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

#  def __str__(self):
#    print("location = " + str(self._loc))
#    print("length = " + str(self._len))
#    print("shipId = " + str(self.shipId))
#    for s in self._cells:
#      print("cells = " + str(s))




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

  def fire(self, locations):
    hit = False
    enemy_player = (~self.current_player) & 3
    for ship in self.getPlayer(enemy_player):
      for location in locations:
        if ship.hit(location):
          hit = True
    self.current_player = enemy_player
    return hit

  def getPlayer(self, player_id):
    if player_id == 1:
      return self.player1
    else:
      return self.player2

  def ready(self):
    # Ensure that no more ships can be placed on either board
    player1_spent = 0
    player2_spent = 0
    for s in self.player1:
       player1_spent += s.get_len()
    for s in self.player2:
      player2_spent += s.get_len()
    
    # Return via boolean expression
    return ((player1_spent + 2) > self.shipMaxSpaceCount
      and (player2_spent + 2) > self.shipMaxSpaceCount)
    
    #return (len(self.player1) == self.shipMaxPlaceCount 
    #  and len(self.player2) == self.shipMaxPlaceCount)



class TestBattleship(unittest.TestCase):
  def testShipCreation(self):
    self.assertEqual(Ship()._loc, 0)
    self.assertEqual(Ship(4)._loc, 4)
    with self.assertRaises(ValueError):
       Ship(200)
    self.assertEqual(Ship(10, 'destroyer')._len,2)
    self.assertTrue(Ship(50, direction="horizontal").checkExists(54))
    self.assertTrue(Ship(50, direction="vertical").checkExists(90))
    self.assertFalse(Ship(50).checkExists(55))
    with self.assertRaises(ValueError):
       Ship(99)
    with self.assertRaises(ValueError):
       Ship(80, direction="vertical")

  def testShipHits(self):
    testShip = Ship(50)
    self.assertFalse(testShip.hit(1))
    self.assertTrue(testShip.hit(51))
    self.assertFalse(testShip.checkExists(51))
    self.assertFalse(testShip.hit(51))
    testShip.hit(50)
    testShip.hit(52)
    testShip.hit(53)
    testShip.hit(54)
    self.assertTrue(testShip.dead())

  def testBattleshipGameCreation(self):
    testShip = Ship(0)
    testGame = BattleshipGame()
    self.assertTrue(testGame.addShip(1, testShip))
    with self.assertRaises(ValueError): # Check that collisions raise an error.
      testGame.addShip(1, testShip)
    testGame.addShip(1, Ship(10))
    testGame.addShip(1, Ship(20))
    testGame.addShip(1, Ship(30))
    testGame.addShip(1, Ship(40))
    with self.assertRaises(ValueError): # check that only 5 ships can be added per player.
      testGame.addShip(1, Ship(50))

    self.assertTrue(testGame.addShip(2, Ship(0)))
    with self.assertRaises(ValueError): # Check that collisions raise an error.
      testGame.addShip(2, Ship(0))
    testGame.addShip(2, Ship(10))
    testGame.addShip(2, Ship(20))
    testGame.addShip(2, Ship(30))
    testGame.addShip(2, Ship(40))
    with self.assertRaises(ValueError): # check that only 5 ships can be added per player.
      testGame.addShip(2, Ship(50))

    with self.assertRaises(ValueError): # check that only 5 ships can be added per player.
      testGame.addShip(2, Ship(2, direction="horizontal"))

  def testBattleshipGameLogic(self):
    testGame2 = BattleshipGame()
    self.assertFalse(testGame2.ready())
    for i in [0,10,20,30,40]:
      testGame2.addShip(1, Ship(i))
    for ship in testGame2.player1:
      for cell in ship._cells:
        ship.hit(cell)
    self.assertTrue(testGame2.checkGameOver(1))

    for i in [50,60,70,80,90]:
      testGame2.addShip(2, Ship(i))
    self.assertTrue(testGame2.ready())
    self.assertTrue(testGame2.fire([50,51,52,53,54]))
    self.assertTrue(testGame2.player2[0].dead())






def main():
  unittest.main()

if __name__ == '__main__':
  main()
