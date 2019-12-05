var express = require('express');
var fs = require ('fs');
var options = {
    key: fs.readFileSync('my-key.pem'),
    cert: fs.readFileSync('my-cert.pem')
  };
var app = express();
var server = require('https').createServer(options,app)
var path = require('path');
var port = process.env.PORT || 8080;

server.listen(port,()=>{
    console.log("Server is listening at ", port);
});

//Routing
app.use(express.static(path.join(__dirname,'public')));
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname + '/index.html'));
});

//Room
var emptyRooms = ["Laihanian Noon", "Hello","WTF","Happy Duck","Bubble Tea"];
var rooms = [];

//Players
var maxPlayerNum = 2;
var totalPlayers = [];

// var playersNum = 0;
// var audience = [];
// var indexes = [0,1,2];

//Game Rule
var destination = 1;
// var fastestClaimed = false;
// var maxNeutralPlayer, maxHappyPlayer, fastestPlayer;
// var readyCount = 0;
// var finishedCount = 0;
// var allDone = false;

var io = require('socket.io').listen(server);

io.sockets.on('connection',
function(socket){

    console.log("A new player entered: "+socket.id);
    var myRoomName;
    var amIinRoom = false;

    //Enter Room Path1:
    socket.on('create new room',()=>{

      //Get a new room name, let the socket join
      myRoomName = emptyRooms[0];
      emptyRooms.splice(0,1);
      socket.join(myRoomName);

      var newPlayer = {
        id: socket.id,
        room:myRoomName,
        pos: 0,
        neutralCount: 0,
        happyCount: 0,
        rotateData: 0,
        tiltData:0,
        isFinished: false,
        img: ""
      }

      //Create a new room object
      var thisRoom = {
        roomName: myRoomName,
        players: [],
        readyCount: 0,
        finishedCount: 0,
        allDone: false,
        fastestClaimed: false,
        result: {
          maxNeutralPlayer: "",
          maxHappyPlayer: "",
          fastestPlayer:""
          }
        }

      //Add the player info to the room
      thisRoom.players.push(newPlayer);

      //store this room info on server
      rooms.push(thisRoom);
      totalPlayers.push(newPlayer);

      socket.emit('new room created', thisRoom);

      // io.to(rooms[0]).emit('welcom',socket.id);
      amIinRoom = true;
      console.log(rooms);
    });

    //Path2: Join Room
    socket.on('join room', function(data){
      var roomExisted = false; 
      console.log(rooms);

      for (let room of rooms){

        //if the room exists
        if (data == room.roomName){
          myRoomName = room.roomName;
          roomExisted = true;

          // check the number of players in this room
          if (room.players.length < maxPlayerNum){
            socket.join(myRoomName);

            var newPlayer = {
              id: socket.id,
              room:myRoomName,
              pos: 0,
              neutralCount: 0,
              happyCount: 0,
              rotateData: 0,
              tiltData:0,
              isReady:false,
              isFinished: false,
              img: ""
            }

            room.players.push(newPlayer);
            
            socket.emit('room joined', room);

            io.to(myRoomName).emit('new player enter',room);
            // socket.broadcast.emit('new player enter',players);

          } else {

            socket.emit('room full');
          }
          
          
          break;
        }
      }

      if (roomExisted == false){
        socket.emit('room null');
      }
    });


    //PART B: In the room
    socket.on('sendHi', function(){
      io.to(myRoomName).emit('forwardHi',socket.id);
    });

    var amIReady = false;
    var amIFinished = false;

    socket.on('I am ready',()=>{

      for (let room of rooms){
        if (myRoomName == room.roomName){

          for (let i = 0 ; i <room.players.length; i++){
            if (socket.id == room.players[i].id){
              room.players[i].isReady = true;
            }
          }
          
          room.readyCount ++;

          if (room.readyCount == room.players.length){
            io.to(myRoomName).emit('all ready');
            // io.sockets.emit("all ready");
            console.log("All ready!");
        }

          break;

        }
      }
    });

    socket.on('update face',function(data){
        
        for (let room of rooms){

          if (myRoomName == room.roomName){
            for (let i = 0 ; i <room.players.length; i++){
              if (socket.id == room.players[i].id){

                room.players[i].rotateData = data.rotateData;
                room.players[i].tiltData = data.tiltData;

                io.to(myRoomName).emit('update face', room);
                break;

              }
            }

          }
        }

    });

    socket.on('update position',(data)=>{

      for (let room of rooms){

        if (myRoomName == room.roomName){
          for (let i = 0 ; i <room.players.length; i++){
            if (socket.id == room.players[i].id){

              room.players[i].pos = data;

              io.to(myRoomName).emit('update position', room);

              if (data >= destination){
                amIFinished = true;
                room.players[i].isFinished = true;

                socket.emit('you are finished');
                
              }
              break;

            }
          }

        }
      }

    });


    socket.on('update happy',(data)=>{

      for (let room of rooms){

        if (myRoomName == room.roomName){
          for (let i = 0 ; i <room.players.length; i++){
            if (socket.id == room.players[i].id){

              room.players[i].happyCount = data;

              break;

            }
          }

        }
      }

    });

    socket.on('update neutral',(data)=>{

      for (let room of rooms){

        if (myRoomName == room.roomName){
          for (let i = 0 ; i <room.players.length; i++){
            if (socket.id == room.players[i].id){

              room.players[i].neutralCount = data;

              break;

            }
          }

        }
      }

    });


    socket.on('doneAndGetUserImage',(data)=>{
      // isFinished = true;

      //update finished user's img data & done data
      for (let room of rooms){

        if (myRoomName == room.roomName){

          for (let i = 0 ; i <room.players.length; i++){
            if (socket.id == room.players[i].id){

              room.players[i].img = data;
              room.finishedCount ++;

              if (room.fastestClaimed == false){
                room.result.fastestPlayer = room.players[i];
                room.fastestClaimed  = true;
              }

              break;

            }
          }

          if (room.players.length > 0){

            if (room.finishedCount == room.players.length){
              room.allDone = true;
              console.log("All are done!!!");
    
              //Get the player with most neutral
              room.result.maxNeutralPlayer = room.players.reduce(function(l, e) {
                return e.neutralCount > l.neutralCount ? e : l;
              });
              // maxNeutralPlayer = totalPlayers.reduce(function(l, e) {
              //   return e.neutralCount > l.neutralCount ? e : l;
              // });
    
              //Get the player with most happy
              room.result.maxHappyPlayer = room.players.reduce(function(l, e) {
                return e.happyCount > l.happyCount ? e : l;
              });

              // maxHappyPlayer = totalPlayers.reduce(function(l, e) {
              //   return e.happyCount > l.happyCount ? e : l;
              // });
                            
              console.log("maxNeutralPlayer: "+ room.result.maxNeutralPlayer.id + ": "+room.result.maxNeutralPlayer.img.length);
              console.log("maxHappyPlayer: "+ room.result.maxHappyPlayer.id+ ": "+room.result.maxHappyPlayer.img.length);
              console.log("fastestPlayer: "+ room.result.fastestPlayer.id+ ": "+room.result.fastestPlayer.img.length);
    
              io.to(myRoomName).emit("all done", room);
              
              // //reset
              // finishedCount = 0;
              // fastestClaimed = false;
              // allDone = false;
              // readyCount = 0;
    
            };
    
          };



        }
      }

      if (totalPlayers.length > 0){

        if (finishedCount == totalPlayers.length){
          allDone = true;
          console.log("All are done!!!");

          //Get the player with most neutral
          maxNeutralPlayer = totalPlayers.reduce(function(l, e) {
            return e.neutralCount > l.neutralCount ? e : l;
          });

          //Get the player with most happy
          maxHappyPlayer = totalPlayers.reduce(function(l, e) {
            return e.happyCount > l.happyCount ? e : l;
          });
          
          // console.log(finishedCount);
          
          console.log("maxNeutralPlayer: "+ maxNeutralPlayer.id + ": "+maxNeutralPlayer.img.length);
          console.log("maxHappyPlayer: "+ maxHappyPlayer.id+ ": "+maxHappyPlayer.img.length);
          console.log("fastestPlayer: "+ fastestPlayer.id+ ": "+fastestPlayer.img.length);

          io.sockets.emit("all done", {
            maxHappyPlayer: maxHappyPlayer,
            maxNeutralPlayer: maxNeutralPlayer,
            fastestPlayer: fastestPlayer
          });
          
          //reset
          finishedCount = 0;
          fastestClaimed = false;
          allDone = false;
          readyCount = 0;

        };

      };

    });
  
    
    socket.on('disconnect',function(){

      //Take the player out of this room
      for (let room of rooms){

        if (myRoomName == room.roomName){
          for (let i = 0 ; i <room.players.length; i++){
            if (socket.id == room.players[i].id){

              room.players.splice(i,1);
              io.to(myRoomName).emit('user left', room.players[i]);

              if (room.readyCount == room.players.length){
                io.to(myRoomName).emit('all ready');
                // io.sockets.emit("all ready");
                console.log("All ready!");
            }

              break;

            }
          }

        }
      }

    });

});


function removeFromArray (ary, ele){
    var index = ary.indexOf(ele);
    if (index > -1){
      ary.splice(index);
    }
  }