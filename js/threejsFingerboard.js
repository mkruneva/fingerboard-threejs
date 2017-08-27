if (!Detector.webgl) Detector.addGetWebGLMessage();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set( -4.5, -47, 491 );

//GUI 
var gui = new dat.GUI();
var cam = gui.addFolder('Camera');
cam.add(camera.position, 'x', 500, 500);

//RENDER
renderer = createRenderer(0x666666);
var parent = document.getElementById('canvasContainer');
parent.appendChild(renderer.domElement);

//TEX AND MAT
var diffTex = new THREE.TextureLoader().load( "tex/beech_wood_albedo.jpg" );
diffTex.wrapS = THREE.RepeatWrapping;
diffTex.wrapT = THREE.RepeatWrapping;
diffTex.repeat.set( 3, 3 );
var aoTex = new THREE.TextureLoader().load( "tex/beech_wood_ao.png" );

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var material2 = new THREE.MeshStandardMaterial({ aoMap: aoTex, color: 0xbbbbbb, map: diffTex, roughness: 0.9 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);


//Plane
var geometry = new THREE.PlaneGeometry( 200, 200, 200 );
var plane = new THREE.Mesh( geometry, material );
scene.add( plane );

//LIGHTS
var ambLight = new THREE.AmbientLight( 0x404040 ); // soft white light
ambLight.intensity = 5;
scene.add( ambLight );

var dirLight = new THREE.DirectionalLight( 0xFFFFFF );
var helper = new THREE.DirectionalLightHelper( dirLight, 5 );
scene.add( dirLight );
scene.add( helper );

// load a resource
var loader = new THREE.OBJLoader();
loader.load(
    // resource URL
    'obj/fingerboard-obj.obj',
    // Function when resource is loaded
    function(object) {
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = material2;
            }
        });
        object.rotation.set( 0, 0, 0 );
        object.position.set( 0, -100, 0 );
        scene.add(object);
    }
);

// loadObject("obj/cube.obj", material);

//Controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);

var animate = function() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
};


animate();

//LOADER
var loaderDiv = document.getElementById("loader");
THREE.DefaultLoadingManager.onStart = function(item, loaded, total) {
    loaderDiv.style.display = 'block';
};

THREE.DefaultLoadingManager.onLoad = function(item, loaded, total) {
    loaderDiv.style.display = 'none';
};

//FUNCTION FOR CREATING RENDERER
function createRenderer(clearColour) {
    myRenderer = new THREE.WebGLRenderer({ antialias: true });
    myRenderer.shadowMap.enabled = true; //enabling shadow maps in the renderer
    myRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    myRenderer.setClearColor(clearColour, 1);
    myRenderer.setSize(window.innerWidth, window.innerHeight);

    return myRenderer;
}

//FUNCTION LOADING OBJ
function loadObject(objPath, material) {
    var loader = new THREE.OBJLoader();
    loader.load(objPath, function(object) {
        console.log(object);
        object.name = "fingerboard";
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = material;
            }
        });
    });
}