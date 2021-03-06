var keys = {
	left: false,
	right: false,
	up: false,
	down: false
}

var myId;
var friends = [];

var spacesphere;

var friendids = [];
var alreadyhave = [];

var composer;
var glitchPass;

var bullets = [];
var sky,sunSphere;

window.onunload=pageleave;


var peer = new Peer({key: 'q6j1ayv7dyvz33di'});

peer.on('open', function(id) {
	console.log('My peer ID is: ' + id);
	myId = id;
});

var serverconnection = peer.connect("god12");


serverconnection.on('open', function() {
	peeridloaded();
});

serverconnection.on('data',function(data)
{
	// console.log(data);
	if(data.structure == "people")
	{
		friendids = data.people;
		console.log(friendids);
		for(var i = 0; i < friendids.length; i++) {
			var id = friendids[i];

			if(id != myId && alreadyhave.indexOf(id) == -1)
			{
				alreadyhave.push(id);
				var friend = {};
				friend.id = id;
				friend.health = 5;
				friend.conn = peer.connect(id);
				var geometry = new THREE.BoxGeometry( 20, 20, 20 );
				var material = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x050505 } );;
				friend.cube = new THREE.Mesh( geometry, material );
				friend.cube.castShadow = true;
				friend.cube.position.y = -33 + 10;
				friend.cube.receiveShadow = true;
				scene.add( friend.cube );
				friends.push(friend);


				var ageometry2 = new THREE.CylinderGeometry( 10, 10, 8 );
				var amaterial2 = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x050505 } );;
				var awheel = new THREE.Mesh( ageometry2, amaterial2 );
				awheel.castShadow = true;
				awheel.position.y = -5;
				awheel.position.x = 10;
				awheel.position.z = 0;
				scene.add(awheel);
				friend.cube.add(awheel);

				awheel.rotation.x = 1.6;
				awheel.rotation.z = 1.6;

				var ageometry3 = new THREE.CylinderGeometry( 10, 10, 8 );
				var amaterial3 = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x050505 } );;
				var awheel2 = new THREE.Mesh( ageometry3, amaterial3 );
				awheel2.castShadow = true;
				awheel2.position.y = -5;
				awheel2.position.x = -10;
				awheel2.position.z = 0;
				scene.add(awheel2);
				friend.cube.add(awheel2);

				awheel2.rotation.x = 1.6;
				awheel2.rotation.z = 1.6;

				var ageometry4 = new THREE.CylinderGeometry( 8, 8, 20 );
				var amaterial4 = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x050505 } );;
				var acannon = new THREE.Mesh( ageometry4, amaterial4 );
				acannon.castShadow = true;
				acannon.position.y = 0;
				acannon.position.x = 0;
				acannon.position.z = 15;
				scene.add(acannon);
				friend.cube.add(acannon);

				// cannon.rotation.x = 1.6;
				acannon.rotation.z = 1.6;
				acannon.rotation.y = 1.6;

				friend.conn.on('open', function() {
					console.log("connected to " + id);

		  	  // Receive messages
		  	  friend.conn.on('data', function(data) {
		  	  	console.log('Received', data);
		  	  });

		  	  // Send messages
		  	  // conn.send('Hello!');
		  	});
			}
		}

	}
	if(data.structure == "keys")
	{
		// console.log("keys are the thing");
		calculateFriendMovement(data.keys,data.person);
	}
});


peer.on('connection', function(conn) {
	console.log("recieved a conncetion");
	conn.on('data', function(data)
	{
		if(data.structure == "position")
		{
		    // console.log('Received ' + data + " from id " + conn.peer);
		    for(var i = 0; i < friends.length; i++)
		    {
		    	if(friends[i].id == conn.peer)
		    	{
		    		friends[i].cube.position.x = data.posx;
		    		friends[i].cube.position.y = data.posy;
		    		friends[i].cube.position.z = data.posz;
		    		friends[i].cube.rotation.y = data.roty;
		    	}
		    }
		}
		if(data.structure == "bullet")
		{
			shootbullet(data.posx,data.posy,data.posz,conn.peer,data.roty);
		}
		if(data.structure == "dead")
		{
  			// scene.remove()
  			if(data.player == myId)
  			{
  				window.location.replace("/gameover.html");
  			}
  			else
  			{
  				scene.remove(friendFromString(data.player).cube);
  			}
  		}
  	});
});

function moveBullets()
{
	for(var i = 0; i < bullets.length; i++)
	{
		bullets[i].geo.translateZ(6);
		bullets[i].timer -= 0.01;

		if(bullets[i].timer < 0)
		{
			scene.remove(bullets[i].geo);
			bullets.splice(i,1);
		}
		else
		{

			for (var y = 0; y < friends.length; y++) {
				// console.log("bullet" + bullets[i].geo.position.x);
				// console.log("person" + friends[y].cube.position.x)
				if (Math.abs(friends[y].cube.position.x - bullets[i].geo.position.x) < 10 && Math.abs(friends[y].cube.position.z - bullets[i].geo.position.z) < 10) {
					if(friends[y].id != bullets[i].id)
					{
						friends[y].health--;

						if(friends[y].health == 4)
						{
							friends[y].cube.material = new THREE.MeshPhongMaterial( { color: 0x3498db, specular: 0x050505 } );
							for (var j = 0; j < friends[y].cube.children.length; j++) {
								friends[y].cube.children[j].material = new THREE.MeshPhongMaterial( { color: 0x3498db, specular: 0x050505 } );
							}
						}
						if(friends[y].health == 3)
						{
							friends[y].cube.material = new THREE.MeshPhongMaterial( { color: 0xf1c40f, specular: 0x050505 } );
							for (var j = 0; j < friends[y].cube.children.length; j++) {
								friends[y].cube.children[j].material = new THREE.MeshPhongMaterial( { color: 0xf1c40f, specular: 0x050505 } );
							}
						}
						if(friends[y].health == 2)
						{
							friends[y].cube.material = new THREE.MeshPhongMaterial( { color: 0xe67e22, specular: 0x050505 } );
							for (var j = 0; j < friends[y].cube.children.length; j++) {
								friends[y].cube.children[j].material = new THREE.MeshPhongMaterial( { color: 0xe67e22, specular: 0x050505 } );
							}
						}
						if(friends[y].health == 1)
						{
							friends[y].cube.material = new THREE.MeshPhongMaterial( { color: 0xe74c3c, specular: 0x050505 } );
							for (var j = 0; j < friends[y].cube.children.length; j++) {
								friends[y].cube.children[j].material = new THREE.MeshPhongMaterial( { color: 0xe74c3c, specular: 0x050505 } );
							}
						}

						if(friends[y].health <= 0)
						{
							scene.remove(friends[y].cube);
							for(var i = 0; i < friends.length; i++)
							{
								var data = {
									structure: "dead",
									player: friends[y].id
								};
								friends[i].conn.send(data);
								// console.log(data);
							}
						}
					}
				}
			}
			if (Math.abs(cube.position.x - bullets[i].geo.position.x) < 10 && Math.abs(cube.position.z - bullets[i].geo.position.z) < 10) {
				if(myId != bullets[i].id)
					{
						glitchPass.goWild = true;
					}
					else
					{
						glitchPass.goWild = false;
					}
			}
			else
			{
				glitchPass.goWild = false;
			}
		}
	}
}

function pageleave() {
	serverconnection.send({structure: "leave"});
}

function shootbullet(posx, posy, posz, id, roty)
{
	console.log(roty);
	var geometry = new THREE.SphereGeometry(5, 25, 25);
	var material = new THREE.MeshPhongMaterial( { color: 0xecf0f1, specular: 0x050505 } );;
	var acube = new THREE.Mesh( geometry, material );
	acube.castShadow = true;
	acube.position.x = posx;
	acube.position.y = posy;
	acube.position.z = posz;
	acube.rotation.y = roty;
	acube.receiveShadow = true;
	scene.add( acube );
	var bullet = {timer: 1, geo: acube, id: id};
	bullets.push(bullet);
}

function peeridloaded()
{
	serverconnection.send({structure: "giveId"});
}

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 );
camera.position.set( 0, 200, 400 );
camera.rotation.x = -200/360;

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 20, 20, 20 );
var material = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x050505 } );;
var cube = new THREE.Mesh( geometry, material );
cube.castShadow = true;
cube.position.y = -33 + 10;
cube.position.x = Math.floor((Math.random() * 150) + -100);
cube.position.z = Math.floor((Math.random() * 150) + -100);

cube.receiveShadow = true;
scene.add( cube );


var colors = [ 0x000000, 0xff0080, 0x8000ff, 0xffffff ];
var geometry = new THREE.Geometry();

for ( var i = 0; i < 2000; i ++ ) {
	var vertex = new THREE.Vector3();
	vertex.x = 0;
	vertex.y = 0;
	vertex.z = 0;
	geometry.vertices.push( vertex );

	geometry.colors.push( new THREE.Color( colors[ Math.floor( Math.random() * colors.length ) ] ) );
}

var material = new THREE.PointCloudMaterial( { size: 1, vertexColors: THREE. VertexColors, depthTest: false, opacity: 0.5, sizeAttenuation: false, transparent: true } );

var mesh = new THREE.PointCloud( geometry, material );
scene.add( mesh );
cube.add(mesh);


var geometry2 = new THREE.CylinderGeometry( 10, 10, 8 );
var material2 = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x050505 } );;
var wheel = new THREE.Mesh( geometry2, material2 );
wheel.castShadow = true;
wheel.position.y = -5;
wheel.position.x = 10;
wheel.position.z = 0;
scene.add(wheel);
cube.add(wheel);

wheel.rotation.x = 1.6;
wheel.rotation.z = 1.6;

var geometry3 = new THREE.CylinderGeometry( 10, 10, 8 );
var material3 = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x050505 } );;
var wheel2 = new THREE.Mesh( geometry3, material3 );
wheel2.castShadow = true;
wheel2.position.y = -5;
wheel2.position.x = -10;
wheel2.position.z = 0;
scene.add(wheel2);
cube.add(wheel2);

wheel2.rotation.x = 1.6;
wheel2.rotation.z = 1.6;

var geometry4 = new THREE.CylinderGeometry( 8, 8, 20 );
var material4 = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x050505 } );;
var cannon = new THREE.Mesh( geometry4, material4 );
cannon.castShadow = true;
cannon.position.y = 0;
cannon.position.x = 0;
cannon.position.z = 15;
scene.add(cannon);
cube.add(cannon);

// cannon.rotation.x = 1.6;
cannon.rotation.z = 1.6;
cannon.rotation.y = 1.6;
// cube.add(camera);

scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
scene.fog.color.setHSL( 0.6, 0, 1 );

hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 0, 1000, -200 );
// scene.add( hemiLight );

dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( 0, 20, -200 );
// dirLight.position.multiplyScalar( 50 );
scene.add( dirLight );

dirLight.castShadow = true;

dirLight.shadowMapWidth = 2048;
dirLight.shadowMapHeight = 2048;

var d = 500;

dirLight.shadowCameraLeft = -d;
dirLight.shadowCameraRight = d;
dirLight.shadowCameraTop = d;
dirLight.shadowCameraBottom = -d;

dirLight.shadowCameraFar = 9500;
dirLight.shadowBias = -0.0001;
dirLight.shadowDarkness = 0.35;


var groundGeo = new THREE.PlaneBufferGeometry( 300, 300 );
var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
groundMat.color.setHSL( 0.095, 1, 0.75 );

var ground = new THREE.Mesh( groundGeo, groundMat );
ground.rotation.x = -Math.PI/2;
ground.position.y = -33;
ground.position.z = 0;
scene.add( ground );

ground.receiveShadow = true;

// SKYDOME

var vertexShader = document.getElementById( 'vertexShader' ).textContent;
var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
var uniforms = {
	topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
	bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
	offset:		 { type: "f", value: 33 },
	exponent:	 { type: "f", value: 0.6 }
}
uniforms.topColor.value.copy( hemiLight.color );

// scene.fog.color.copy( uniforms.bottomColor.value );

// var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
// var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

// var sky = new THREE.Mesh( skyGeo, skyMat );
// scene.add( sky );

var spacetex = THREE.ImageUtils.loadTexture("images/firesmall.jpg");
spacetex.filter = THREE.NearestFilter;
 var spacesphereGeo = new THREE.SphereGeometry(600,600,600);
 var spacesphereMat = new THREE.MeshBasicMaterial();
 spacesphereMat.map = spacetex;

 spacesphere = new THREE.Mesh(spacesphereGeo,spacesphereMat);

 //spacesphere needs to be double sided as the camera is within the spacesphere
 spacesphere.material.side = THREE.DoubleSide;

 spacesphere.material.map.wrapS = THREE.ClampToEdgeWrapping;
 spacesphere.material.map.minFilter = THREE.NearestFilter;
 spacesphere.material.map.wrapT = THREE.ClampToEdgeWrapping;
 // spacesphere.material.map.repeat.set( 1, 1);

 scene.add(spacesphere);

composer = new THREE.EffectComposer( renderer );
				composer.addPass( new THREE.RenderPass( scene, camera ) );

				glitchPass = new THREE.GlitchPass();
				glitchPass.renderToScreen = true;
				composer.addPass( glitchPass );

// renderer.setClearColor( scene.fog.color );
renderer.gammaInput = true;
renderer.gammaOutput = true;

renderer.shadowMapEnabled = true;
renderer.shadowMapCullFace = THREE.CullFaceBack;

function render() {
	requestAnimationFrame( render );
	// renderer.render( scene, camera );
	composer.render();

	calculateMovement(keys);
	moveBullets();

	spacesphere.rotation.x += 1/360;
	spacesphere.rotation.y += 2/360;
	spacesphere.rotation.z += 3/360;

	// serverconnection.send({structure: "keys",keys: keys});

	// camera.position.y += 1;
	// cube.position.y -= 1;

	// particleSystem.rotation.y += 0.01;
}
render();

function calculateMovement(keysdown)
{
	// console.log("asdsad");
	if(keysdown.right)
	{

		cube.rotation.y += 20/360;
	}
	if(keysdown.left)
	{

		cube.rotation.y -= 20/360;
	}
	if(keysdown.up)
	{

		if (cube.position.x < -149) {
			console.log("you are dead");
			scene.remove(cube);
			for(var i = 0; i < friends.length; i++)
			{
				var data = {
					structure: "dead",
					player: myId
				};
				friends[i].conn.send(data);
									// console.log(data);
								}
							window.location.replace("/gameover.html");
							}
							if (cube.position.x > 149) {
								console.log("you are dead");
								scene.remove(cube);
								for(var i = 0; i < friends.length; i++)
								{
									var data = {
										structure: "dead",
										player: myId
									};
									friends[i].conn.send(data);
								// console.log(data);
							}
						window.location.replace("/gameover.html");
						}
						if (cube.position.z < -148) {
							console.log("you are dead");
							scene.remove(cube);
							for(var i = 0; i < friends.length; i++)
							{
								var data = {
									structure: "dead",
									player: myId
								};
								friends[i].conn.send(data);
								// console.log(data);
							}
					window.location.replace("/gameover.html");
						}


						if (cube.position.z > 148) {
							console.log("you are dead");
							scene.remove(cube);
							for(var i = 0; i < friends.length; i++)
							{
								var data = {
									structure: "dead",
									player: myId
								};
								friends[i].conn.send(data);
								// console.log(data);
							}
							window.location.replace("/gameover.html");
						}
						 wheel.rotation.x += 0.05;
   						 wheel.rotation.y += 0.0;
   						 wheel2.rotation.x += 0.05;
   						 wheel2.rotation.x += 0.00;
						cube.translateZ( 1.5 );

					}


					if(keysdown.down)
					{
						if (cube.position.z < -149) {
							console.log("you are dead");
							scene.remove(cube);
							for(var i = 0; i < friends.length; i++)
							{
								var data = {
									structure: "dead",
									player: myId
								};
								friends[i].conn.send(data);
								// console.log(data);
							}
							window.location.replace("/gameover.html");
						}
						if (cube.position.z > 149) {
							console.log("you are dead");
							scene.remove(cube);
							for(var i = 0; i < friends.length; i++)
							{
								var data = {
									structure: "dead",
									player: myId
								};
								friends[i].conn.send(data);
								// console.log(data);
							}
							window.location.replace("/gameover.html");
						}
						if (cube.position.z < -148) {
							console.log("you are dead");
							scene.remove(cube);
							for(var i = 0; i < friends.length; i++)
							{
								var data = {
									structure: "dead",
									player: myId
								};
								friends[i].conn.send(data);
								// console.log(data);
							}
							window.location.replace("/gameover.html");
						}

						if (cube.position.z > 148) {
							console.log("you are dead");
							scene.remove(cube);
							for(var i = 0; i < friends.length; i++)
							{
								var data = {
									structure: "dead",
									player: myId
								};
								friends[i].conn.send(data);
								// console.log(data);
							}
						window.location.replace("/gameover.html");
						}

						wheel.rotation.x += -0.05;
   						 wheel.rotation.y += 0.0;
   						 wheel2.rotation.x += -0.05;
   						 wheel2.rotation.x += 0.00;
						cube.translateZ( -1.5 );

					}

					for(var i = 0; i < friends.length; i++)
					{
						var data = {
							structure: "position",
							posx: cube.position.x,
							posy: cube.position.y,
							posz: cube.position.z,
							roty: cube.rotation.y
						};
						friends[i].conn.send(data);
		// console.log(data);
	}
}

function calculateFriendMovement(keysdown,friend)
{
	var friendcube;

	console.log("asdsad");


	friendcube = friendFromString(friend).cube;

	if(keysdown.right)
	{
		friendcube.rotation.y -= 15/360;
	}
	if(keysdown.left)
	{
		friendcube.rotation.y += 15/360;
	}
	if(keysdown.up)
	{
		wheel.rotation.x += 0.05;
   		wheel.rotation.y += 0.0;
   		wheel2.rotation.x += 0.05;
   		wheel2.rotation.x += 0.00;
		friendcube.translateZ( -3 );
	}
	if(keysdown.down)
	{
		wheel.rotation.x += -0.05;
   						 wheel.rotation.y += 0.0;
   						 wheel2.rotation.x += -0.05;
   						 wheel2.rotation.x += 0.00;
		friendcube.translateZ( 3 );
	}

	var data = {
		structure: "position",
		posx: friendcube.position.x,
		posy: friendcube.position.y,
		posz: friendcube.position.z,
		roty: friendcube.rotation.y
	};

	for(var i = 0; i < friends.length; i++)
	{
		friends[i].conn.send(data);
			// console.log(data);
		}
	}

	function friendFromString(id)
	{
		for(var i = 0; i < friends.length; i++)
		{
			if(friends[i].id == id)
			{
				return friends[i];
			}
		}
	}

	$(document).keydown(function (evt) {
		if (evt.which == 16) {
			keys.shift = true;
			for(var i = 0; i < friends.length; i++)
			{
				friends[i].conn.send({
					structure: "bullet",
					posx: cube.position.x,
					posy: cube.position.y,
					posz: cube.position.z,
					roty: cube.rotation.y
				});
			}
			shootbullet(cube.position.x,cube.position.y,cube.position.z,myId,cube.rotation.y);
		}
		if (evt.which == 37) {
			keys.left = true;
		}
		if (evt.which == 38) {
			keys.up = true;
		}
		if (evt.which == 39) {
			keys.right = true;
		}
		if (evt.which == 40) {
			keys.down = true;
		}
    // if()
});

	$(document).keyup(function (evt) {
		if (evt.which == 16) {
			keys.shift = false;
		}
		if (evt.which == 37) {
			keys.left = false;
		}
		if (evt.which == 38) {
			keys.up = false;
		}
		if (evt.which == 39) {
			keys.right = false;
		}
		if (evt.which == 40) {
			keys.down = false;
		}
	});

	function loadTexture( path ) {

		var texture = new THREE.Texture( texture_placeholder );
		var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

		var image = new Image();
		image.onload = function () {

			texture.image = this;
			texture.needsUpdate = true;

		};
		image.src = path;

		return material;
	}
