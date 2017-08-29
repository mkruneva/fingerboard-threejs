if (!Detector.webgl) Detector.addGetWebGLMessage();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(35, 5 / 3, 1, 2000); //5/3 ratio corresponds to the 0.6 width/height canvas container padding 
scene.add(camera);
camera.position.set(0, 0, 750);


//RENDER
renderer = createRenderer(0x222222);
var parent = document.getElementById('canvasContainer');
parent.appendChild(renderer.domElement);

//Cubemap 

var envMap = new THREE.CubeTextureLoader()
    .setPath('tex/cubemap/')
    .load([
        'posx.jpg',
        'negx.jpg',
        'posy.jpg',
        'negy.jpg',
        'posz.jpg',
        'negz.jpg',
    ]);

//TEX AND MAT
var diffTex = new THREE.TextureLoader().load("tex/beech_wood_albedo.jpg");
diffTex.wrapS = THREE.RepeatWrapping;
diffTex.wrapT = THREE.RepeatWrapping;
diffTex.repeat.set(3, 3);
var aoTex = new THREE.TextureLoader().load("tex/beech_wood_ao.png");
var nrmTex = new THREE.TextureLoader().load("tex/beech_wood_anormal.png");
nrmTex.wrapS = THREE.RepeatWrapping;
nrmTex.wrapT = THREE.RepeatWrapping;
nrmTex.repeat.set(3, 3);
var roughtTex = new THREE.TextureLoader().load("tex/beech_wood_rough.png");

var fingerboardMat = new THREE.MeshStandardMaterial({
    aoMap: aoTex,
    color: 0xbbbbbb,
    envMap: envMap,
    map: diffTex,
    normalMap: nrmTex,
    normalScale: new THREE.Vector3(0.3, 0.3),
    roughness: 0.96,
    roughnessMap: roughtTex
});

var backgroundTex = new THREE.TextureLoader().load("tex/background.jpg");
backgroundTex.wrapS = THREE.RepeatWrapping;
backgroundTex.wrapT = THREE.RepeatWrapping;
backgroundTex.repeat.set(3, 3);
var backgroundMat = new THREE.MeshBasicMaterial( {color: 0xAAAAAA, map: backgroundTex });

//LIGHTS
var ambLight = new THREE.AmbientLight(0x404040); // soft white light
ambLight.intensity = 2;
scene.add(ambLight);

var spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(0, 100, 600);
spotLight.rotation.set((45 * Math.PI / 180), 0, 0);
spotLight.intensity = 0.7;
scene.add(spotLight);

var spotLight2 = new THREE.SpotLight(0xffffff);
spotLight2.position.set(0, 100, -600);
spotLight2.rotation.set((45 * Math.PI / 180), 0, 0);
spotLight2.intensity = 0.7;
scene.add(spotLight2);
// var spotLightHelper = new THREE.SpotLightHelper( spotLight2 );
// scene.add( spotLightHelper );

var hemLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.6);
scene.add(hemLight);

//Geo 

var geometry = new THREE.PlaneGeometry( 3000, 3000 );
var plane = new THREE.Mesh( geometry, backgroundMat );
plane.position.set( 0, 0, -1000 );
camera.add( plane );


// load a resource
var loader = new THREE.OBJLoader();
loader.load(
    // resource URL
    'obj/fingerboard-obj.obj',
    // Function when resource is loaded
    function(object) {
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = fingerboardMat;
            }
        });
        object.rotation.set(0, 0, 0);
        object.position.set(0, -90, 0);
        scene.add(object);
    }
);

// loadObject("obj/cube.obj", material);


//GUI 
var gui = new dat.GUI();
var cam = gui.addFolder('Camera');
cam.add(camera.position, 'x', -100, 150);
cam.add(camera.position, 'y', -100, 150);
cam.add(camera.position, 'z', 0, 1500);
var planegui = gui.addFolder('plane');
planegui.add(plane.position, 'x', -1000, 1000);
planegui.add(plane.position, 'y', -1000, 1000);
planegui.add(plane.position, 'z', -1000, 1000);
// var sportlightGui = gui.addFolder('spot light');
// sportlightGui.add(spotLight.position, 'x', -500, 500);
// sportlightGui.add(spotLight.position, 'y', 0, 2000);
// sportlightGui.add(spotLight.position, 'z', -500, 500);
// sportlightGui.add(spotLight.rotation, 'x', 0, 2*Math.PI);
// sportlightGui.add(spotLight.rotation, 'y', 0, 2*Math.PI);
// sportlightGui.add(spotLight.rotation, 'z', 0, 2*Math.PI);

//Controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);

var animate = function() {
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

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