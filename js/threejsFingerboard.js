if (!Detector.webgl) Detector.addGetWebGLMessage();

let camera;
let controls;
let scene;
let renderer;
let sprite;
let spriteBehindObject;

let loadPercent;

let spr1;
let fbGroup;

const annDiv = document.getElementById('ann');
annDiv.style.display = 'none';

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
    fbGroup = createfbGroup(0, -75, 0);

    //line 
    createLine([-165, 133, 34]);

    // //helper sphere 
    // var geo = new THREE.SphereGeometry( 5, 32, 32 );
    // var mat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    // var sphere1 = new THREE.Mesh( geo, mat );
    // sphere1.position.set(-165, 133, 34);  
    // fbGroup.add( sphere1 );

    // var sphere = new THREE.Mesh( geo, mat );
    // sphere.position.set(-150, 160, 60); // +15, +27, -26
    // fbGroup.add( sphere );

    // //Line Sphere Helper GUI
    // var gui = new dat.GUI();
    // var lineGui = gui.addFolder('Line position');
    // lineGui.add(sphere.position, 'x', -180, -120);
    // lineGui.add(sphere.position, 'y', 120, 200);
    // lineGui.add(sphere.position, 'z', 20, 80);

    //ANNOTATIONS
    // const canvas = document.createElement('canvas');
    // const context = canvas.getContext('2d');

    spr1 = createSprite(-165, 133, 34, 'tex/annotations/1.png', 1, fbGroup); //sloper 30 degrees
    const spr2 = createSprite(-87, 181, 50, 'tex/annotations/1.png', 1, fbGroup); //sloper 20 degrees

    //MATERIALS
    const backgroundMat = createBackgroundMaterial();
    const fingerboardMat = createFingerBoardMaterial();

    //LIGHTS
    createLights();

    // CREATE BACKGROUND PLANE 
    createBackgroundPlane(backgroundMat);

    //LOAD FINGERBOARD
    let fingerb = loadObject('obj/fingerboard-obj.obj', fingerboardMat, fbGroup);
    // console.log('fingerb is ', fingerb); // fingerb is undefined ?

    //Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    //LOADER
    loadingScreen(spr1, spr2);

    
}

// FUNCTIONS

// Annotations and Sprites 
function createSprite(x, y, z, tex, scale, parent) {
    var spriteMap = new THREE.TextureLoader().load(tex);
    var spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x + 15, y + 27, z + 26);
    sprite.scale.set(10, 10, 1);
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

function createfbGroup(x, y, z) {
    const fbGroup = new THREE.Object3D;
    fbGroup.name = 'fingerboard group';
    fbGroup.position.set(x, y, z);
    fbGroup.rotation.set(0, 0, 0);
    scene.add( fbGroup );

    return fbGroup;
}

// Line 
function createLine([x, y, z]) {
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.4, linecap: 'round' });
    let geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(x, y, z));
    geometry.vertices.push(new THREE.Vector3(x + 15, y + 27, z + 26));
    let line = new THREE.Line(geometry, material);
    fbGroup.add(line);

    return line;
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
        },
        function ( xhr ) {
            loadPercent = Math.round( xhr.loaded / xhr.total * 100 );
            document.querySelector('.percent').innerHTML = loadPercent;;
        },
        function ( error ) {
            console.log( 'An error happened' );
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

function loadingScreen(sprite1, sprite2) {
    const loaderDiv = document.getElementById('loader');
    THREE.DefaultLoadingManager.onStart = function() {
        loaderDiv.style.display = 'block';
    };
    THREE.DefaultLoadingManager.onLoad = function() {
        loaderDiv.style.display = 'none';
        annDiv.style.display = 'block';
        // sprite1.visible = true;
        // sprite2.visible = true;
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

function updateAnnotationOpacity(sprite1, fbGroup) {
        // currently works for sprite1
        const meshDistance = camera.position.distanceTo(fbGroup.position);;
        const spriteDistance = camera.position.distanceTo(sprite1.position);
        spriteBehindObject = spriteDistance > meshDistance;
        sprite1.material.opacity = spriteBehindObject ? 0.1 : 1;
}


function updateScreenPosition() {
    const annPos = [[-150, 85, 60],[-87, 81, 50]];  //line point 2 pos - fBgroup
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
        ann.style.opacity = spriteBehindObject ? 0.1 : 1;
    }
}


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
    updateAnnotationOpacity(spr1, fbGroup);
    updateScreenPosition();
}