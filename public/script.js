//DOM Elements
//part A:
var partADom = document.getElementById('partA');
var pageA_1 = document.getElementById('A_1');
var pageA_2 = document.getElementById('A_2');
var pageA_3 = document.getElementById('A_3');
var pageA_4_1 = document.getElementById('A_4_1');
var pageA_4_2 = document.getElementById('A_4_2');
//pageA_1
var entranceBtn = document.getElementById("entranceBtn");
//pageA_2
var soloBtn = document.getElementById('soloBtn');
var groupBtn = document.getElementById('groupBtn');
//pageA_3
var createNewRoomBtn = document.getElementById('createNewRoomBtn');
var joinRoomBtn = document.getElementById('joinRoomBtn');
//page A_4_1
var myRoomName = document.getElementById('myRoomName');
var copyBtn = document.getElementById('copyBtn');
var enterRoomBtn1 = document.getElementById("enterRoomBtn1");
//page A_4_2
var enterRoomBtn2 = document.getElementById("enterRoomBtn2");

//Part B:
var partBDom = document.getElementById('partB');
var B_roomTitle = document.getElementById('roomTitle');
const myVideo = document.getElementById('video');
var emotionDiv = document.getElementById('emotionState');
var instructionDiv = document.getElementById('instruction');
var playInfo = document.createElement("div");
var container = document.getElementById('content');
var noteDiv = document.getElementById('notes');
var endingPage = document.getElementById('ending');

var hiBtn = document.getElementById('sendHi');
var alsoCopyBtn = document.getElementById('alsoCopy');
var readyButton = document.getElementById('readyBtn');


//Face APIs Variables
var leftDist, rightDist, faceLength, upLip, downLip, rotate, tilt;
var expressions, angry, happy, neutral, sad, fearful;

//3D Scene variables
var camera, scene, renderer,light, geometry;
var width = window.innerWidth, height = window.innerHeight;
var gltfRotate;
var avatars = [];
var root, root2, root3, root4, root5, root6;
var cameraTarget;

// var loaders=[];
// var renderedObjects = [];
// var avatars = ['pika.glb','test2.glb'];
// var avatarsName = ['mesh_m0-PolyPaper12_-241354','buffer-0-mesh-0',]

//Player interactions
var myRoom = '';
var myId;
var myPos = 0;
var mySpeed = 0.1;
// var myPlayerMode = "";

var myNeutralCount = 0;
var myHappyCount = 0;

var amIReady = false;
var allReady = false;
var gameStarted = false;
var amIFinished = false;
var imageSent = false;

// var destination = 1;

var roomData = null;



//Sockets communication starts -----------------------------------------------
var socket = io.connect();

socket.on('connect',function(){
  console.log("Connected");
});

//PartA ---------------------------------------------------------------
entranceBtn.addEventListener("click", function(){
  pageA_1.style.display = 'none';
  pageA_2.style.display = 'block';
});

//Choose group mode
groupBtn.addEventListener("click", function(){
  pageA_2.style.display = 'none';
  pageA_3.style.display = 'block';
});

//Path 1: Create a New Room
createNewRoomBtn.addEventListener("click", function(){
  pageA_3.style.display = 'none';
  pageA_4_1.style.display = 'block';
  socket.emit('create new room');
});

socket.on('new room created', function(data){
  console.log(data);
  myRoom = data.roomName;
  myRoomName.innerHTML = myRoom;
  B_roomTitle.innerHTML = myRoom;
});

copyBtn.addEventListener("click", function(){
  copyTextToClipboard(myRoom);
});

// enterRoomBtn1.addEventListener("click", function(){
//   partADom.style.display='none';
//   partBDom.style.display='block';
// });

//Path 2: Join an Existing Room
joinRoomBtn.addEventListener('click', function(){
  pageA_3.style.display='none';
  pageA_4_2.style.display='block';
});

enterRoomBtn2.addEventListener('click',function(){
  var inputRoomName = document.getElementById('inputRoomName').value;
  console.log('Your input is: '+inputRoomName);
  socket.emit('join room', inputRoomName);

});


socket.on('room joined',(data)=>{
  console.log(data);
  partADom.style.display = 'none';
  partBDom.style.display = 'block';

  myRoom = data.roomName;
  B_roomTitle.innerHTML = myRoom;
})

socket.on('room null',()=>{
  console.log("No such room");
})

socket.on('room full', ()=>{
  console.log('the room is full');
})


//PART B ------------------------------------------------------
enterRoomBtn1.addEventListener('click',function(){
  partADom.style.display='none';
  partBDom.style.display='block';
  startGame();
});

enterRoomBtn2.addEventListener('click',function(){
  partADom.style.display='none';
  partBDom.style.display='block';
  startGame();
});

alsoCopyBtn.addEventListener('click', function(){
  copyTextToClipboard(myRoom);
});

hiBtn.addEventListener('click', function(){
  socket.emit("sendHi");
});

socket.on('forwardHi', function(data){
  console.log("A player: "+data+" said Hi to you.");
});

//Ready ---------
readyButton.addEventListener("click",function(e){
  console.log("button clicked!");
  amIReady = true;

  socket.emit("I am ready");
  instructionDiv.removeChild(readyButton);
});

var readyCountDown;

socket.on('all ready',()=>{
    allReady = true;
    console.log("All ready!Count down started.");

    readyCountDown = setTimeout(function(){
      gameStarted = true;
      noteDiv.innerHTML = "Game started!! Click anywhere to run, NOW!";
    }, 3000);

});

socket.on('new player enter', function(data){
  console.log(data);
  clearTimeout(readyCountDown);
});


//During the game -----
socket.on('update face',function(data){
  // console.log(data);
  roomData = JSON.parse(JSON.stringify(data));

  // playersData = [];
  // playersData = JSON.parse(JSON.stringify(data));
});

socket.on('update position',function(data){
  // console.log(data);
  roomData = JSON.parse(JSON.stringify(data));

  // playersData = [];
  // playersData = JSON.parse(JSON.stringify(data));
});

//After the game -----
socket.on('you are finished',(data)=>{
  amIFinished = true;
  console.log("You have arrived! You are: " );
});

socket.on("all done",(data)=>{
  console.log(data);
  document.getElementById('award1').innerHTML = "Fastest Finger Runner";
  document.getElementById('image1').src = data.fastestPlayer.img;

  document.getElementById('award2').innerHTML = "Happiest Finger Runner";
  document.getElementById('image2').src = data.maxHappyPlayer.img;

  document.getElementById('award3').innerHTML = "Coolest Finger Runner";
  document.getElementById('image3').src = data.maxNeutralPlayer.img;

  endingPage.style.display = "block";
});

socket.on('user left', (data)=>{
  console.log('a user left');
  console.log(data);
})

socket.on('disconnect', function(){

})


//Game part ---------------------------------------------------------------
function startGame (){
  //Face API
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]).then(startVideo);

  function startVideo() {
    let constraints = { audio: false, video: true };
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        // Attach to our video object
        myVideo.srcObject = stream;
        // Wait for the stream to load enough to play
        myVideo.onloadedmetadata = function(e) {
            myVideo.play();
        };
    })
    .catch(function(err) {
        alert(err);
    });
  }


  myVideo.addEventListener('play', () => {

    const sourceCanvas = faceapi.createCanvasFromMedia(myVideo);
    document.body.append(sourceCanvas);
    const displaySize = { width: myVideo.width, height: myVideo.height };
    faceapi.matchDimensions(sourceCanvas, displaySize);

    //Use faceAPI to get tilt and rotate data
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(myVideo, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      var ctx = sourceCanvas.getContext('2d');
      ctx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
      landmarks = await faceapi.detectFaceLandmarks(myVideo);

      //Face movement
      leftDist = resizedDetections[0].landmarks.positions[28].x - resizedDetections[0].landmarks.positions[2].x;
      rightDist = resizedDetections[0].landmarks.positions[14].x - resizedDetections[0].landmarks.positions[28].x;
      faceLength = resizedDetections[0].landmarks.positions[14].x - resizedDetections[0].landmarks.positions[2].x;
      upLip = resizedDetections[0].landmarks.positions[51].y - resizedDetections[0].landmarks.positions[33].y;
      downLip = resizedDetections[0].landmarks.positions[8].y - resizedDetections[0].landmarks.positions[57].y;

      rotate = scale(leftDist/faceLength,0,1,-1,1).toFixed(2);
      tilt = scale(downLip/upLip,1.6,3.0,1,-1).toFixed(2);

      //Expression detection
      expressions = resizedDetections[0].expressions;
      happy = resizedDetections[0].expressions.happy;
      angry = resizedDetections[0].expressions.angry;
      sad = resizedDetections[0].expressions.sad;
      neutral = resizedDetections[0].expressions.neutral;
      fearful = resizedDetections[0].expressions.fearful;

      //if player has not arrived at destination
      if (amIFinished == false){
        if (happy > 0.55 ) {
          // console.log("happy: " + happy)
          mySpeed = 0.05;
          myHappyCount ++;
          socket.emit('update happy',myHappyCount);
          emotionDiv.innerHTML = "Happy";
        };

        if (sad > 0.55 ) {
          // console.log("sad: " + sad);
          mySpeed = 0.2;
          emotionDiv.innerHTML = "Sad";
        };

        if (angry > 0.55 ) {
          mySpeed = 5;
          console.log("angry: " + angry);
          emotionDiv.innerHTML = "Angry";
        };

        if (neutral > 0.55 ) {
          // console.log("neutral: " + neutral)
          mySpeed = 0.1;
          myNeutralCount ++;
          socket.emit('update neutral',myNeutralCount);
          emotionDiv.innerHTML = "Neutral";
        };

        if (fearful > 0.55 ) {
          // console.log("fearful: " + fearful)
          mySpeed = 0.5;
          emotionDiv.innerHTML = "Fear";
        };
      }

      socket.emit('update face',{
        rotateData: rotate,
        tiltData: tilt
      });

      if (amIFinished == true && imageSent == false){
        // var snapshot = ctx.drawImage(myVideo, 0,0, sourceCanvas.width, sourceCanvas.height);
        ctx.drawImage(myVideo, 0,0, sourceCanvas.width, sourceCanvas.height);
        var dataUrl = sourceCanvas.toDataURL();
        socket.emit('doneAndGetUserImage',dataUrl);

        imageSent = true;
        console.log("image sent");
    }

    }, 100);


      window.addEventListener("click",function(e){

        if (amIFinished == false && gameStarted == true){
          myPos += mySpeed;
          console.log("my position is: "+myPos);
          socket.emit("update position",myPos);
        }

      });

      // runButton.addEventListener("click",function(e){
      //     if (amIDone == false && allReady == true){
      //       myPos += mySpeed;
      //     console.log("my position is: "+myPos);
      //     socket.emit("update position",myPos);
      //     }
      //   });

  //3D part ---------------------------------------------------------------
  function init(){
    renderer = new THREE.WebGLRenderer();
  //renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
  // Add renderer to page
    window.addEventListener( 'resize', onWindowResize, false );
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0x101010);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffe9df);


    //foggggggggg
    const color = 0xff7f4d;
    const density = 0.005;
    scene.fog = new THREE.FogExp2(color, density);

    // running camera position   ++++++DONT DELETE!++++++
    // camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
    // camera.position.set(-35,22, 31);
    // scene.add(camera);

    //start camera position
    camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
    //camera.position.set(100,10,6);
    camera.position.set(0, 10, 6);
  //  camera.lookAt(new THREE.Vector3(-1,1,0));
    camera.lookAt(new THREE.Vector3(-18, 0, 0));
    scene.add(camera);
    //camera.up = new THREE.Vector3(0,0,1);


  //  var lookAtPosition = new THREE.Vector3(-1,1,0);
    var lookAtPosition = new THREE.Vector3(-18, 0, 0);
    var lookAtEndPosition = new THREE.Vector3(0,0,0);
    var cube = new THREE.BoxGeometry(1,1,1);
    cube.position = lookAtPosition;
    camera.target = cube;

    // if (roomData && roomData.players && roomData.players[0]){
    //   camera.position.set(100,10,6);
    // };

    //var camera2position = new THREE.Vector3(-45,22, 30);
    var camera2position = new THREE.Vector3(-45,22, 30);

    var tween = new TWEEN.Tween( camera.position )
        .to( {
            x: camera2position.x,
            y: camera2position.y,
            z: camera2position.z
        }, 70000 )   //set this to 7000
        .easing( TWEEN.Easing.Linear.None ).onUpdate( function () {

            camera.lookAt( new THREE.Vector3(-1,1,0));

        } )
        .onComplete( function () {

            camera.lookAt( lookAtEndPosition );

        } )
        .start();

    var tween = new TWEEN.Tween( camera.target )
        .to( {
            x: 0,
            y: 0,
            z: 0
        }, 70000 )   //set this to 7000
        .easing( TWEEN.Easing.Linear.None )
        .onUpdate( function () {

        } )
        .onComplete( function () {

             camera.lookAt( lookAtEndPosition );

        } )
        .start();


        //try to load avatars
        //avatarload1();
        //avatarload2();
        //avatarload3();
        //avatarload4();
        loadAvatar(0, 'assets/avatar1.glb', [-18, 0, 0]);
        loadAvatar(1, 'assets/avatar2.glb', [-18, 0, 7]);
        loadAvatar(2, 'assets/avatar3.glb', [-18, 0, 14]);
        loadAvatar(3, 'assets/avatar4.glb', [-18, 0, -7]);
        arrowload();

        //
        renderer.gammaOutput = true;
        renderer.gammaFactor = 2.2;



        //light
        light = new THREE.SpotLight(0xffffff, 0.2);
        light2 = new THREE.AmbientLight(0xffffff);
        light.position.setScalar(5);
        scene.add(light);
        scene.add(light2);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
        light.position.set( 5, 20, 5 ); 			//default; light shining from top
        light.castShadow = true;
        var helper = new THREE.SpotLightHelper( light, 5 );
        scene.add( helper );
        light.shadow.bias = -0.004;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;





        geometry = new THREE.PlaneGeometry(5, 7, 1, 1);

        //main plane
        var planeGeometry = new THREE.PlaneGeometry(120, 40, 1, 1);
        //var planeTexture = new THREE.TextureLoader().load( 'orange.jpeg' );
        var planeMaterial = new THREE.MeshBasicMaterial( { color: 0xff7f4d } );
        //var planeMaterial = new THREE.MeshLambertMaterial( { map: planeTexture } );
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -0.5 * Math.PI;
        plane.receiveShadow = true;
        plane.castShadow = true;
        plane.position.set(25,0,3);
        scene.add(plane);
        //plane downside
        var planeGeometry2 = new THREE.PlaneGeometry(120, 60, 1, 1);
        //var planeMaterial2 = new THREE.MeshBasicMaterial( { color: 0x806a62} );
        var planeTexture2 = new THREE.TextureLoader().load( 'gray.jpeg' );
        var planeMaterial2 = new THREE.MeshLambertMaterial( { map: planeTexture2 } );
        var plane2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
        plane2.rotation.x = -0.5 * Math.PI;
        plane2.castShadow = true;
        plane2.receiveShadow = true;
        plane2.position.set(25,-0.01,3);
        scene.add(plane2);
    }



    // for checking avatars' head and body mapping names
    function dumpObject(obj, lines = [], isLast = true, prefix = '') {
      const localPrefix = isLast ? '└─' : '├─';
      lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
      const newPrefix = prefix + (isLast ? '  ' : '│ ');
      const lastNdx = obj.children.length - 1;
      obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
      });
      return lines;
    }



    function loadAvatar(name, glbUrl, initPosition){
      //gltf loader
      loader = new THREE.GLTFLoader();
      loader.crossOrigin = true;

      // Load a glTF resource
      loader.load(
        // resource URL
        //'https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/ladybug.gltf',
        glbUrl,
        // called when the resource is loaded
        function ( gltf ) {
          root = gltf.scene;
          scene.add(root);
          root.position.set(...initPosition);
          root.scale.set(1,1,1);
          gltf.scenes; // Array<THREE.Scene>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object

          root.traverse((obj) => {
            if (obj.castShadow !== undefined) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });

          var avatarHead = root.getObjectByName('head');
          avatarHead.castShadow = true;
          avatarHead.receiveShadow = true;
          avatars[name] = avatarHead;
        },



        // called while loading is progressing
        function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
          console.log( 'An error happened' );
        }
      );

    }


    function avatarload1(){
      //gltf loader
      loader = new THREE.GLTFLoader();
      loader.crossOrigin = true;

      // Load a glTF resource
      loader.load(
        // resource URL
        //'https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/ladybug.gltf',
        'assets/avatar1.glb',
        // called when the resource is loaded
        function ( gltf ) {
          root = gltf.scene;
          scene.add(root);
          root.position.set(-18, 0, 0);
          root.scale.set(1,1,1);
          gltf.scenes; // Array<THREE.Scene>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object

          root.traverse((obj) => {
            if (obj.castShadow !== undefined) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });
          //gltf.scene.rotation.y = 0.4 * Math.PI;
          LadyBug005 = root.getObjectByName('head');
          LadyBug005.castShadow = true;
          LadyBug005.receiveShadow = true;
          console.log("avatar1" + dumpObject(root).join('\n'));
          console.log("loadededededed");

        },



        // called while loading is progressing
        function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
          console.log( 'An error happened' );
        }
      );

    }

    function avatarload2(){
      //gltf loader
      loader = new THREE.GLTFLoader();
      loader.crossOrigin = true;

      // Load a glTF resource
      loader.load(
        // resource URL
        //'https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/ladybug.gltf',
        'assets/avatar2.glb',
        // called when the resource is loaded
        function ( gltf ) {
          root2 = gltf.scene;
          scene.add(root2);
          root2.position.set(-18,0,7);
          root2.scale.set(1,1,1);
          gltf.scenes; // Array<THREE.Scene>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object
          root2.traverse((obj) => {
            if (obj.castShadow !== undefined) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });
          //gltf.scene.rotation.y = 0.4 * Math.PI;
          test2rotate = root2.getObjectByName('head');
          console.log("avatar2" + dumpObject(root2).join('\n'));
          console.log("loadededededed");
        },

        // called while loading is progressing
        function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
          console.log( 'An error happened' );
        }
      );

    }

    function avatarload3(){
      //gltf loader
      loader = new THREE.GLTFLoader();
      loader.crossOrigin = true;

      // Load a glTF resource
      loader.load(
        // resource URL
        //'https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/ladybug.gltf',
        'assets/avatar3.glb',
        // called when the resource is loaded
        function ( gltf ) {
          root3 = gltf.scene;
          scene.add(root3);
          root3.position.set(-18,0,14);
          root3.scale.set(1,1,1);
          gltf.scenes; // Array<THREE.Scene>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object
          //gltf.scene.rotation.y = 0.4 * Math.PI;
          var head = root3.getObjectByName('head');
          var rightleg = root3.getObjectByName('rightleg');
          var leftleg = root3.getObjectByName('leftleg');
          console.log("avatar3" + dumpObject(root3).join('\n'));
          console.log("loadededededed");
        },

        // called while loading is progressing
        function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
          console.log( 'An error happened' );
        }
      );

    }

    function avatarload4(){
      //gltf loader
      loader = new THREE.GLTFLoader();
      loader.crossOrigin = true;

      // Load a glTF resource
      loader.load(
        // resource URL
        //'https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/ladybug.gltf',
        'assets/avatar4.glb',
        // called when the resource is loaded
        function ( gltf ) {
          root4 = gltf.scene;
          scene.add(root4);
          root4.position.set(-18,0,-7);
          root4.scale.set(1,1,1);
          gltf.scenes; // Array<THREE.Scene>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object
          //gltf.scene.rotation.y = 0.4 * Math.PI;
          var head = root.getObjectByName('head');
          console.log("avatar4" + dumpObject(root4).join('\n'));
          console.log("loadededededed");
        },

        // called while loading is progressing
        function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
          console.log( 'An error happened' );
        }
      );

    }


        function arrowload(){
          //gltf loader
          loader = new THREE.GLTFLoader();
          loader.crossOrigin = true;

          // Load a glTF resource
          loader.load(
            // resource URL
            //'https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/ladybug.gltf',
            'assets/arrow.glb',
            // called when the resource is loaded
            function ( gltf ) {
              root5 = gltf.scene;
              scene.add(root5);
              if (roomData && roomData.players && roomData.players[0]){
                root5.position.set(-18,7,0);
              } else if (roomData && roomData.players && roomData.players[1]){
                root5.position.set(-18,0,7);
              }
              root5.scale.set(1,1,1);
              gltf.scenes; // Array<THREE.Scene>
              gltf.cameras; // Array<THREE.Camera>
              gltf.asset; // Object
              console.log("loadededededed");
            },

            // called while loading is progressing
            function ( xhr ) {
              console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // called when loading has errors
            function ( error ) {
              console.log( 'An error happened' );
            }
          );

        }

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

    }

  function animate() {

    requestAnimationFrame(animate);

    if (roomData && roomData.players) {
      roomData.players.forEach(function (player, idx) {
        if (!avatars[idx]) {
          return;
        }
        for (const child of avatars[idx].children) {
          child.rotation.y = player.rotateData * Math.PI/2;
          child.rotation.x = player.tiltData  * Math.PI/2;
          child.visible = true;
        }
        root.position.x = -13 + player.pos;
      });
    }

    //
    // if (roomData && roomData.players && roomData.players[0]){
    //   if (avatars['LadyBug005']) {
    //     for (const LadyBug of LadyBug005.children) {
    //       LadyBug.rotation.y = roomData.players[0].rotateData * Math.PI/2;
    //       LadyBug.rotation.x = roomData.players[0].tiltData  * Math.PI/2;
    //     // LadyBug.position.z = playersData[0].pos;
    //       LadyBug.visible = true;
    //     }
    //     root.position.x = -13 + roomData.players[0].pos;
    //   }
    // }else {
    //   for (const element of LadyBug005.children) {
    //     element.visible = false;
    //   }
    // }
    //
    // if (roomData && roomData.players && roomData.players[1]){
    //   if (test2rotate) {
    //     for (const element of test2rotate.children) {
    //       element.rotation.y = roomData.players[1].rotateData  * Math.PI/2;
    //       element.rotation.x = roomData.players[1].tiltData  * Math.PI/2;
    //       // element.position.z = playersData[1].pos;
    //       element.visible = true;
    //     }
    //     root2.position.x = -22 + roomData.players[1].pos;
    //   }
    // } else {
    //   for (const element of test2rotate.children) {
    //     element.visible = false;
    //   }
    // }


    renderer.render(scene, camera);
    TWEEN.update();
  }

  init();
  animate();
  });
}

//functions ---------------------------------------------------------------
const scale = function(num, in_min, in_max, out_min, out_max) {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

//Copy to clipboard
function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position="fixed";  //avoid scrolling to bottom
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}
