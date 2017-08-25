if (!Detector.webgl) Detector.addGetWebGLMessage();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


//GUI 
var gui = new dat.GUI();
var cam = gui.addFolder('Camera');
cam.add(camera.position, 'x', 500, 500);
console.log(gui);

renderer = createRenderer(0xdddddd);
var parent = document.getElementById('canvasContainer');
parent.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var material2 = new THREE.MeshBasicMaterial({ color: 0xbbbbbb });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

var loader = new THREE.OBJLoader();
// load a resource
loader.load(
    // resource URL
    'obj/cube.obj',
    // Function when resource is loaded
    function(object) {
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = material2;
            }
        });
        object.scale.set(0.5,0.05,0.5);
        cube.add(object);
    }
);

// loadObject("obj/cube.obj", material);

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