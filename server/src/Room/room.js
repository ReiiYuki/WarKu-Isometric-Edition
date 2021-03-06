let Board = require('./board')
class Room {
  constructor(id,type,remote) {
    this.id = id
    this.remotes = []
    this.addPlayer(remote)
    this.board = new Board(this.remotes)
  }

  addPlayer(remote){
    remote.playerNum = this.remotes.length
    remote.hp = 50
    this.remotes.push(remote)
    if (this.remotes.length == 2){
      this.remotes[0].responseCreateRoomSuccess(this.id)
      this.remotes[1].responseCreateRoomSuccess(this.id)
    }
  }

  sendBoard(){
    this.remotes[0].updateBoard(this.board.formatFloors(0))
    this.remotes[1].updateBoard(this.board.formatFloors(1))
  }

  spawnUnit(remote,x,y,type){
    if (this.remotes.indexOf(remote)==1){
      x = this.inversePosition(x)
      y = this.inversePosition(y)
    }
    this.board.spawnUnit(remote,x,y,type)
  }

  moveUnit(remote,x,y,direction){
    if (this.remotes.indexOf(remote)==1){
      x = this.inversePosition(x)
      y = this.inversePosition(y)
      direction = this.inverseDirection(direction)
    }
    this.board.moveUnit(x,y,direction)
  }

  updateUnit(remote,x,y){
    if (this.remotes.indexOf(remote)==1){
      x = this.inversePosition(x)
      y = this.inversePosition(y)
    }
    this.board.updateUnit(remote,x,y)
  }

  changeDirection(remote,x,y,direction){
    if (this.remotes.indexOf(remote)==1){
      x = this.inversePosition(x)
      y = this.inversePosition(y)
      direction = this.inverseDirection(direction)
    }
    this.board.changeDirection(x,y,direction)
  }

  build(remote,x,y,targetX,targetY){
    if (this.remotes.indexOf(remote)==1){
      x = this.inversePosition(x)
      y = this.inversePosition(y)
      targetX = this.inversePosition(targetX)
      targetY = this.inversePosition(targetY)
    }
    this.board.build(x,y,targetX,targetY)
  }

  hide(remote,x,y){
    if (this.remotes.indexOf(remote)==1){
      x = this.inversePosition(x)
      y = this.inversePosition(y)
    }
    this.board.hide(x,y)
  }

  inversePosition(x) {
    return (x-15)*-1
  }

  inverseDirection(direction){
    if (direction==1) return 2
    else if (direction==2) return 1
    else if (direction==3) return 4
    else if (direction==4) return 3
  }

  updateHp(remote){
    let opRemote = this.remotes.find((rem)=>(rem!=remote))
    remote.updateHp(remote.hp,opRemote.hp)
    opRemote.updateHp(opRemote.hp,remote.hp)
  }

  shouldStart(){
    if (this.remotes[0].isReady&&this.remotes[1].isReady){
      this.remotes[0].start()
      this.remotes[1].start()
      this.board.start()
    }
  }

  end(){
    this.board.end()
  }
}

module.exports = Room
