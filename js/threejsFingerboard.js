if (!Detector.webgl) Detector.addGetWebGLMessage();

let camera;
let controls;
let scene;
let renderer;
let sprite;
let spriteBehindObject;
const annotation = document.querySelector('.sloper30');
const annotation2 = document.querySelector('.sloper20');

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, 5 / 3, 1, 2000); //5/3 ratio corresponds to the 0.6 width/height canvas container padding 
    scene.add(camera);
    camera.position.set(-50, 0, 750);

    //RENDER
    renderer = createRenderer(0x222222);
    const parent = document.getElementById('canvasContainer');
    parent.appendChild(renderer.domElement);

    // Empty Group
    const FBgroup = createFBgroup(0, -75, 0);

    //ANNOTATIONS
    // const canvas = document.createElement('canvas');
    // const context = canvas.getContext('2d');

    createSprite(-176, 106, 50, 'tex/annotations/1.png'); //sloper 30 degrees
    createSprite(-87, 106, 50, 'tex/annotations/1.png'); //sloper 20 degrees

    // //SPTITE GUI
    // var gui = new dat.GUI();
    // var spriteGui = gui.addFolder('Sprite position');
    // spriteGui.add(sprite_20deg.position, 'x', -500, 500);
    // spriteGui.add(sprite_20deg.position, 'y', -500, 500);
    // spriteGui.add(sprite_20deg.position, 'z', -500, 500);

    //MATERIALS
    const backgroundMat = createBackgroundMaterial();
    const fingerboardMat = createFingerBoardMaterial();

    //LIGHTS
    createLights();

    // CREATE BACKGROUND PLANE 
    createBackgroundPlane(backgroundMat);

    //LOAD FINGERBOARD
    const fingerb = loadObject('obj/fingerboard-obj.obj', fingerboardMat, FBgroup);

    //INVISIBLE CUBE
    const invisibleCube = createInvisibleBox(622, 154, 64, FBgroup);

    //Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    //LOADER
    loadingScreen();
}

// FUNCTIONS

// Annotations and Sprites 
function createSprite(x, y, z, tex, scale) {
    var spriteMap = new THREE.TextureLoader().load(tex);
    var spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, y, z);
    sprite.scale.set(20, 20, 1);
    scene.add(sprite);

    return sprite;
}

//Materials and Textures
function repeatTex(mapName, repeat) {
    mapName.wrapS = THREE.RepeatWrapping;
    mapName.wrapT = THREE.RepeatWrapping;
    mapName.repeat.set(repeat, repeat);
}

function loadTextures() {
    var maps = {
        diffTex: new THREE.TextureLoader().load('tex/beech_wood_albedo.jpg'),
        aoTex: new THREE.TextureLoader().load('tex/beech_wood_ao.png'),
        nrmTex: new THREE.TextureLoader().load('tex/beech_wood_anormal.png'),
        roughtTex: new THREE.TextureLoader().load('tex/beech_wood_rough.png'),
        backgroundTex: new THREE.TextureLoader().load('tex/background.jpg'),
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
        roughness: 0.98,
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

function createFBgroup(x, y, z) {
    const fbgroup = new THREE.Object3D;
    fbgroup.name = 'fingerboard group';
    fbgroup.position.set(x, y, z);
    fbgroup.rotation.set(0, 0, 0);
    scene.add( fbgroup );

    return fbgroup;
}

function createInvisibleBox(width, height, depth, parent) {
    var geometry = new THREE.CubeGeometry(width, height, depth);
    var material = new THREE.MeshBasicMaterial({ color: 0x0000FF });
    var cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 76, 31);
    cube.visible = false; //hiding the Cube
    parent.add(cube);

    return cube;
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

function loadObject(objpath, material, parent) {
    createFingerBoardMaterial();
    var loader = new THREE.OBJLoader();
    loader.load(objpath,
        function(object) {
            object.name = 'fingerboard';
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                }
            });
            parent.add(object);
            // console.log('fingerboard is ',  object);
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
    var loaderDiv = document.getElementById('loader');
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

    if (scene.children[2] && scene.children[1]) {
        // WORKAROUND - invisibleCube and Sprite - not defined 
        // currenly works for sprite 1 only
        var sprite = scene.children[2];
        var invCube = scene.children[1].children[0];
        const meshDistance = camera.position.distanceTo(invCube.position);
        const spriteDistance = camera.position.distanceTo(sprite.position);
        spriteBehindObject = spriteDistance > meshDistance;
        sprite.material.opacity = spriteBehindObject ? 0.25 : 1;
    }

    // const meshDistance = camera.position.distanceTo(invisibleCube.position);
    // const spriteDistance = camera.position.distanceTo(sprite.position);
    // spriteBehindObject = spriteDistance > meshDistance;
    // sprite.material.opacity = spriteBehindObject ? 0.25 : 1;
}

function updateScreenPosition() {
    const vector = new THREE.Vector3(-176, 106, 50); // sprite position
    const canvas = renderer.domElement;

    vector.project(camera);
    vector.x = Math.round((0.5 + vector.x / 2) * (canvas.clientWidth / window.devicePixelRatio));
    vector.y = Math.round((0.5 - vector.y / 2) * (canvas.clientHeight / window.devicePixelRatio)); //changed from canvas.height to canvas.clienntHeight

    annotation.style.top = `${vector.y}px`;
    annotation.style.left = `${vector.x}px`;
    annotation.style.opacity = spriteBehindObject ? 0.25 : 1;

    const vector2 = new THREE.Vector3(-87, 106, 50); // sprite position 
    vector2.project(camera);
    vector2.x = Math.round((0.5 + vector2.x / 2) * (canvas.clientWidth / window.devicePixelRatio));
    vector2.y = Math.round((0.5 - vector2.y / 2) * (canvas.clientHeight / window.devicePixelRatio));

    annotation2.style.top = `${vector2.y}px`;
    annotation2.style.left = `${vector2.x}px`;
    annotation2.style.opacity = spriteBehindObject ? 0.25 : 1;
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
    updateAnnotationOpacity();
    updateScreenPosition();
}