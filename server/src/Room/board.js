let Unit = require('./unit')
class Board {
//<editor-fold> Constructor
  constructor(remotes){
    this.SIZE = 16
    this.createFloor()
    this.remotes = remotes
    this.time = 183
  }
//</editor-fold>

//<editor-fold> Unit

//<editor-fold> SpawnUnit
  spawnUnit(remote,x,y,type){
    if (this.isSpawnZone(remote,x,y)){
      this.units[x][y] = new Unit(type,remote,this)
      this.units[x][y].setPosition(x,y)
    }
    this.getUnit(x,y,x,y)
  }

  isSpawnZone(remote,x,y){
    let isSpawnLine = y==this.SIZE-1
    if (this.remotes.indexOf(remote)==1) isSpawnLine = y==0
    return isSpawnLine && [0,1,10,12,13,14,16].indexOf(this.floors[x][y])>=0 && !this.units[x][y]
  }
//</editor-fold>

//<editor-fold> Attack

//</editor-fold>

//<editor-fold> MoveUnit
  updateUnit(remote,x,y){
    if (!this.units[x][y]) return;
    let direction = this.units[x][y].direction
    let changeX = x
    let changeY = y
    this.units[x][y].direction = 0
    if (direction==1) changeX = x-1
    else if (direction==2) changeX = x+1
    else if (direction==3) changeY = y-1
    else if (direction==4) changeY = y+1
    if (direction!=0) {
      this.units[changeX][changeY] = this.units[x][y]
      this.units[changeX][changeY].setPosition(changeX,changeY)
      delete this.units[x][y]
      this.units[x][y] = null
    }
    this.getUnit(x,y,changeX,changeY,0)
    this.reachEndLine(changeX,changeY)
  }

  moveUnit(x,y,direction){
      this.units[x][y].direction = direction
      this.getUnit(x,y,x,y,0)
  }

  getUnit(x,y,changeX,changeY,status){
    this.remotes[0].updateUnit(x,y,changeX,changeY,this.units[x][y],status)
    this.remotes[1].updateUnit(this.inversePosition(x),this.inversePosition(y),this.inversePosition(changeX),this.inversePosition(changeY),this.units[x][y],status)
  }

  reachEndLine(x,y){
    if (this.isEndLine(x,y)){
      console.log("End");
      let atk = this.units[x][y].owner
      this.remotes.find((rem)=>(rem!=this.units[x][y].owner)).hp -= this.units[x][y].attack
      delete this.units[x][y]
      this.units[x][y] = null
      this.getUnit(x,y,x,y,3)
      this.updateHp(atk)
    }
  }

  updateHp(atk){
    let hp = this.remotes[0].hp
    let opHp = this.remotes[1].hp
    console.log(hp+" "+opHp);
    let num_atk = 0
    if (atk == this.remotes[1]) num_atk = 1
    this.remotes[0].updateHp(hp,opHp,num_atk)
    this.remotes[1].updateHp(opHp,hp,(num_atk-1)*-1)
  }

  isEndLine(x,y){
    let unit = this.units[x][y]
    if (this.remotes.indexOf(unit.owner)==0) return y==0
    else if (this.remotes.indexOf(unit.owner)==1) return y==this.SIZE-1
    return false
  }

  inversePosition(x) {
    return (x-15)*-1
  }

  changeDirection(x,y,direction){
    if (direction==1)
      if (this.canMove(x-1,y))
        this.units[x][y].direction = direction
    if (direction==2)
      if (this.canMove(x+1,y))
        this.units[x][y].direction = direction
    if (direction==3)
      if (this.canMove(x,y-1))
        this.units[x][y].direction = direction
    if (direction==4)
      if (this.canMove(x,y+1))
        this.units[x][y].direction = direction
    this.getUnit(x,y,x,y,0)
  }

  canMove(x,y){
    return y<this.SIZE && x<this.SIZE && y>=0 && x>=0 && [0,1,10,12,13,14,16,18,19,20,21].indexOf(this.floors[x][y])>=0 && !this.units[x][y]
  }
//</editor-fold>

//<editor-fold> Worker Unit
  build(x,y,targetX,targetY){
    if (this.units[x][y].type==0){
      if (!this.units[targetX][targetY]){
        if ([0,13].indexOf(this.floors[targetX][targetY])>=0){
          this.floors[targetX][targetY] = 18
        }else if (this.floors[targetX][targetY]==7) {
          this.floors[targetX][targetY] = 20
        }else if (this.floors[targetX][targetY]==8){
          this.floors[targetX][targetY] = 21
        }
        if ([18,20,21].indexOf(this.floors[targetX][targetY])>=0){
          this.units[x][y] = null
          this.updateTile(targetX,targetY)
          this.getUnit(x,y,x,y,3)
        }
      }
    }
  }

  updateTile(x,y){
    this.remotes[0].updateTile(x,y,this.floors[x][y])
    this.remotes[1].updateTile(this.inversePosition(x),this.inversePosition(y),this.floors[x][y])
  }
//</editor-fold>

//<editor-fold> Hide
  hide(x,y){
    if(this.canHide(x,y)) this.units[x][y].hide()
    this.getUnit(x,y,x,y,3)
  }

  canHide(x,y){
    return [1,18,19].indexOf(this.floors[x][y])>=0
  }
//</editor-fold>

//</editor-fold>

//<editor-fold> Formatting

  formatFloors(index){
    let str = ""
    if (index==0){
      for (let i = 0;i<this.SIZE;i++){
        for (let j  =0;j<this.SIZE;j++){
          str+= this.floors[i][j]+" "
        }
      }
    }else {
      for (let i = this.SIZE-1;i>=0;i--){
        for (let j =this.SIZE-1;j>=0;j--){
          let tile = this.floors[i][j]
          //River
          if (tile==3) tile = 6
          else if (tile==6) tile = 3
          else if (tile == 4) tile = 5
          else if (tile == 5 ) tile = 4
          //Mountain
          else if (tile == 9) tile = 17
          else if (tile == 10) tile = 16
          else if (tile == 11) tile = 15
          else if (tile == 12) tile = 14
          else if (tile == 14) tile = 12
          else if (tile == 15) tile = 11
          else if (tile == 16) tile = 10
          else if (tile == 17) tile = 9
          str+= tile+" "
        }
      }
    }
    return str
  }

//</editor-fold>

// <editor-fold> Place Tile

  createFloor(){
    this.floors = []
    this.units = []
    for (let i = 0;i<this.SIZE;i++){
      this.floors.push([])
      this.units.push([])
      for (let j = 0;j<this.SIZE;j++){
        this.floors[i].push(0)
        this.units[i].push(null)
      }
    }
    this.placeRiver()
    this.placeMountain()
    this.placeForest()
    this.placeStone()
  }

  placeRiver(){
    if (Math.round(Math.random())==1){
      let y = Math.floor((Math.random()*this.SIZE))
      let x = 0
      let state = [4,6,8][Math.floor(Math.random()*3)]
      this.floors[x][y] = state
      if (state==4) y++
      else if (state==6) y--
      else if (state==8) x++
      while (x<this.SIZE&&y<this.SIZE&&x>=0&&y>=0){
        if (state==5||state==8) state = [4,6,8][Math.floor(Math.random()*3)]
        else if (state==3) state = [4,8][Math.floor(Math.random()*2)]
        else if (state==4||state==7) state = [7,5][Math.floor(Math.random()*2)]
        else if (state==6) state = 3
        this.floors[x][y] = state
        if (state==3||state==5||state==8) x++
        else if (state==4||state==7) y++
        else if (state==6) y--
      }
    }
  }

  placeMountain(){
    let numMount = Math.floor(Math.random()*11)
    for (let i =0;i<numMount;i++ ){
      var x = Math.floor(Math.random()*this.SIZE)
      var y = Math.floor(Math.random()*this.SIZE)
      if (this.floors[x][y]==0||[9,10,11,12,14,15,16,17].indexOf(this.floors[x][y])>0){
        this.floors[x][y] = 13
        if (x-1>=0&&y-1>=0&&this.floors[x-1][y-1]==0) this.floors[x-1][y-1] = 9
        if (x-1>=0&&this.floors[x-1][y]==0) this.floors[x-1][y] = 10
        if (x-1>=0&&y+1<this.SIZE&&this.floors[x-1][y+1]==0) this.floors[x-1][y+1] = 11
        if (y-1>=0&&this.floors[x][y-1]==0) this.floors[x][y-1] = 12
        if (y+1<this.SIZE&&this.floors[x][y+1]==0) this.floors[x][y+1] = 14
        if (x+1<this.SIZE&&y-1>=0&&this.floors[x+1][y-1]==0) this.floors[x+1][y-1] = 15
        if (x+1<this.SIZE&&this.floors[x+1][y]==0) this.floors[x+1][y] = 16
        if (x+1<this.SIZE&&y+1<this.SIZE&&this.floors[x+1][y+1]==0) this.floors[x+1][y+1] = 17
      }
    }
  }

  placeForest(){
    for (let i = 0;i<Math.floor(Math.random()*20);i++){
      var x = Math.floor(Math.random()*this.SIZE)
      var y = Math.floor(Math.random()*this.SIZE)
      if (this.floors[x][y]==0) this.floors[x][y] = 1
    }
  }

  placeStone(){
    for (let i = 0;i<Math.floor(Math.random()*10);i++){
      var x = Math.floor(Math.random()*this.SIZE)
      var y = Math.floor(Math.random()*this.SIZE)
      if (this.floors[x][y]==0) this.floors[x][y] = 2
    }
  }

// </editor-fold>

//<editor-fold> Exit Condition
  updateTime(){
    this.remotes.forEach((remote)=>{
      remote.updateTime(this.time)
    })
  }

  start(){
    this.timeloop = setInterval((self)=>{
      self.time-=1
      self.updateTime()
      if (self.time==0){
        self.end()
      }
    },1000,this)
  }

  end(){
    clearInterval(this.timeloop)
    this.result()
  }

  result(){
    if (this.remotes[0].hp==this.remotes[1].hp){
      this.remotes[0].showResult(1)
      this.remotes[1].showResult(1)
    }else if (this.remotes[0].hp>this.remotes[1].hp){
      this.remotes[0].showResult(0)
      this.remotes[1].showResult(2)
    }else if (this.remotes[0].hp<this.remotes[1].hp){
      this.remotes[0].showResult(2)
      this.remotes[1].showResult(0)
    }
  }
//</editor-fold>

}

//<editor-fold> Tile Description
/**
0 = Normal Tile * -
1 = Forest Tile * +
2 = Stone Tile
3 = RiverRightUp
4 = RiverLeftUp
5 = RiverRightDown
6 = RiverLeftDown
7 = RiverDown -
8 = RiverLeft -
9 = MountainRidgeRightUp
10 = MountainSlopeRight *
11 = MountainRidgeRightDown
12 = MountainSlopeUp *
13 = MountainPeak * -
14 = MountainSlopeDown *
15 = MountainRidgeLeftUp
16 = MountainSlopeLeft *
17 = MountainRidgeLeftDown
18 = tower0 +
19 = tower1 +
20 = bridgeLeft *
21 = bridgeDown *
**/
//</editor-fold>

module.exports = Board
