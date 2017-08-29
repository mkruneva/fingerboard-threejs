if (!Detector.webgl) Detector.addGetWebGLMessage();

let camera;
let controls;
let scene;
let renderer;
let sprite;
let spriteBehindObject;
const annotation = document.querySelector(".annotation");

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, 5 / 3, 1, 2000); //5/3 ratio corresponds to the 0.6 width/height canvas container padding 
    scene.add(camera);
    camera.position.set(0, 0, 750);


    //RENDER
    renderer = createRenderer(0x222222);
    var parent = document.getElementById('canvasContainer');
    parent.appendChild(renderer.domElement);


    //ANNOTATIONS
    // const canvas = document.createElement('canvas');
    // const context = canvas.getContext('2d');
    // console.log(context);

    var spriteMap = new THREE.TextureLoader().load("tex/annotations/1.png");
    var spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(-176, 66, 50);
    sprite.scale.set(50, 50, 1);
    scene.add(sprite);

    //SPTITE GUI
    var gui = new dat.GUI();
    var spriteGui = gui.addFolder('Camera');
    spriteGui.add(sprite.position, 'x', -500, 500);
    spriteGui.add(sprite.position, 'y', -500, 500);
    spriteGui.add(sprite.position, 'z', -500, 500);

    //MATERIALS
    var backgroundMat = createBackgroundMaterial();
    var fingerboardMat = createFingerBoardMaterial();

    //LIGHTS
    createLights();

    //CREATE BACKGROUND PLANE 
    createBackgroundPlane(backgroundMat);

    //LOAD FINGERBOARD
    loadObject('obj/fingerboard-obj.obj', fingerboardMat);

    //Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    //LOADER
    loadingScreen();
}

//FUNCTIONS
//Materials and Textures
function repeatTex(mapName, repeat) {
    mapName.wrapS = THREE.RepeatWrapping;
    mapName.wrapT = THREE.RepeatWrapping;
    mapName.repeat.set(repeat, repeat);
}

function loadTextures() {
    var maps = {
        diffTex: new THREE.TextureLoader().load("tex/beech_wood_albedo.jpg"),
        aoTex: new THREE.TextureLoader().load("tex/beech_wood_ao.png"),
        nrmTex: new THREE.TextureLoader().load("tex/beech_wood_anormal.png"),
        roughtTex: new THREE.TextureLoader().load("tex/beech_wood_rough.png"),
        backgroundTex: new THREE.TextureLoader().load("tex/background.jpg"),
    }
    repeatTex(maps.diffTex, 3);
    repeatTex(maps.nrmTex, 3);
    repeatTex(maps.backgroundTex, 3);
    maps.envCubeMap = new THREE.CubeTextureLoader()
        .setPath('tex/cubemap/')
        .load([
            'posx.jpg',
            'negx.jpg',
            'posy.jpg',
            'negy.jpg',
            'posz.jpg',
            'negz.jpg',
        ]);
    return maps;
}

function createFingerBoardMaterial() {
    var textureContainer = loadTextures();
    var material = new THREE.MeshStandardMaterial({
        aoMap: textureContainer.aoTex,
        color: 0xbbbbbb,
        envMap: textureContainer.envCubeMap,
        map: textureContainer.diffTex,
        normalMap: textureContainer.nrmTex,
        normalScale: new THREE.Vector3(0.3, 0.3),
        roughness: 0.96,
        roughnessMap: textureContainer.roughtTex
    });

    return material;
}

function createBackgroundMaterial() {
    var textureContainer = loadTextures();
    var material = new THREE.MeshBasicMaterial({ color: 0xAAAAAA, map: textureContainer.backgroundTex });

    return material;
}

function createBackgroundPlane(material) {
    var geometry = new THREE.PlaneGeometry(3000, 3000);
    var plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, 0, -1400);
    camera.add(plane);

    return plane;
}

//Function LIGHTS
function createLights() {
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

    var hemLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.6);
    scene.add(hemLight);
}

function loadObject(objpath, material) {
    createFingerBoardMaterial();
    var loader = new THREE.OBJLoader();
    loader.load(objpath,
        function(object) {
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                }
            });
            object.rotation.set(0, 0, 0);
            object.position.set(0, -90, 0);
            scene.add(object);
            console.log(object);
        }
    );
}

function createGUI() {
    var gui = new dat.GUI();
    var cam = gui.addFolder('Camera');
    cam.add(camera.position, 'x', -100, 150);
    cam.add(camera.position, 'y', -100, 150);
    cam.add(camera.position, 'z', 0, 1500);
    var sportlightGui = gui.addFolder('spot light');
    sportlightGui.add(spotLight.position, 'x', -500, 500);
    sportlightGui.add(spotLight.position, 'y', 0, 2000);
    sportlightGui.add(spotLight.position, 'z', -500, 500);
    sportlightGui.add(spotLight.rotation, 'x', 0, 2 * Math.PI);
    sportlightGui.add(spotLight.rotation, 'y', 0, 2 * Math.PI);
    sportlightGui.add(spotLight.rotation, 'z', 0, 2 * Math.PI);
}

function loadingScreen() {
    var loaderDiv = document.getElementById("loader");
    THREE.DefaultLoadingManager.onStart = function() {
        loaderDiv.style.display = 'block';
    };
    THREE.DefaultLoadingManager.onLoad = function() {
        loaderDiv.style.display = 'none';
    };
}

//FUNCTION FOR CREATING RENDERER
function createRenderer(clearColour) {
    myRenderer = new THREE.WebGLRenderer({ antialias: true });
    myRenderer.shadowMap.enabled = true; //enabling shadow maps in the renderer
    myRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    myRenderer.setClearColor(clearColour, 1);
    myRenderer.setSize(window.innerWidth, window.innerHeight);

    return myRenderer;
}

function updateAnnotationOpacity() {
    const meshDistance = camera.position.distanceTo(mesh.position);
    const spriteDistance = camera.position.distanceTo(sprite.position);
    spriteBehindObject = spriteDistance > meshDistance;
    sprite.material.opacity = spriteBehindObject ? 0.25 : 1;

    // Do you want a number that changes size according to its position?
    // Comment out the following line and the `::before` pseudo-element.
    sprite.material.opacity = 0;
}

function updateScreenPosition() {
    const vector = new THREE.Vector3(250, 250, 250);
    const canvas = renderer.domElement;

    vector.project(camera);

    vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
    vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

    annotation.style.top = `${vector.y}px`;
    annotation.style.left = `${vector.x}px`;
    annotation.style.opacity = spriteBehindObject ? 0.25 : 1;
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
    //updateAnnotationOpacity();
    //updateScreenPosition();
}