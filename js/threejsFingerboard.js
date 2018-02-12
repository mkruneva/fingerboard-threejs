if (!Detector.webgl) Detector.addGetWebGLMessage();

let camera;
let controls;
let scene;
let renderer;
let sprite;
let spriteBehindObject;

init();
animate();

const annDiv = document.getElementById('ann');
annDiv.style.display = 'none';

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

    const spr1 = createSprite(-176, 181, 50, 'tex/annotations/1.png', 1, FBgroup); //sloper 30 degrees
    const spr2 = createSprite(-87, 181, 50, 'tex/annotations/1.png', 1, FBgroup); //sloper 20 degrees

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
function createSprite(x, y, z, tex, scale, parent) {
    var spriteMap = new THREE.TextureLoader().load(tex);
    var spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, y, z);
    sprite.scale.set(20, 20, 1);
    sprite.visible = false;
    parent.add(sprite);

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
    const loaderDiv = document.getElementById('loader');
    THREE.DefaultLoadingManager.onStart = function() {
        loaderDiv.style.display = 'block';
    };
    THREE.DefaultLoadingManager.onLoad = function() {
        loaderDiv.style.display = 'none';
        annDiv.style.display = 'block';
        const sprite1 = scene.children[1].children[0];
        const sprite2 = scene.children[1].children[1];
        sprite1.visible = true;
        sprite2.visible = true;
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

        // WORKAROUND - invisibleCube and Sprite - not defined 
        const sprite1 = scene.children[1].children[0];
        const sprite2 = scene.children[1].children[1];
        const invCube = scene.children[1].children[2];
        const meshDistance = camera.position.distanceTo(invCube.position);
        const spriteDistance1 = camera.position.distanceTo(sprite1.position);
        const spriteDistance2 = camera.position.distanceTo(sprite1.position);
        spriteBehindObject1 = spriteDistance1 > meshDistance;
        spriteBehindObject2 = spriteDistance2 > meshDistance;
        sprite1.material.opacity = spriteBehindObject1 ? 0.25 : 1;
        sprite2.material.opacity = spriteBehindObject2 ? 0.25 : 1;

    // const meshDistance = camera.position.distanceTo(invisibleCube.position);
    // const spriteDistance = camera.position.distanceTo(sprite.position);
}



function updateScreenPosition() {
    const annPos = [[-176, 81, 50],[-87, 81, 50]];
    const selectors = ['.sloper30','.sloper20']
    let ann = [];

    for (let i = 0; i < annPos.length; i++) {
        const pos = annPos[i];
        const vec = new THREE.Vector3(pos[0], pos[1], pos[2]);
        const canvas = renderer.domElement;

        vec.project(camera);
        vec.x = Math.round((0.5 + vec.x / 2) * (canvas.clientWidth / window.devicePixelRatio));
        vec.y = Math.round((0.5 - vec.y / 2) * (canvas.clientHeight / window.devicePixelRatio)); //changed from canvas.height to canvas.clienntHeight

        const ann = document.querySelector(selectors[i]);
        ann.style.top = `${vec.y}px`;
        ann.style.left = `${vec.x}px`;
        ann.style.opacity = spriteBehindObject ? 0.25 : 1;
    }
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