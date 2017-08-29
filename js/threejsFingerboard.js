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

    //Annotations
    // var spritey = makeTextSprite(" Hello, ", { fontsize: 24, borderColor: { r: 255, g: 0, b: 0, a: 1.0 }, backgroundColor: { r: 255, g: 100, b: 100, a: 0.8 } });
    // spritey.position.set(-85, 105, 55);
    // scene.add(spritey);

    // var spritey = makeTextSprite(" World! ", { fontsize: 32, fontface: "Georgia", borderColor: { r: 0, g: 0, b: 255, a: 1.0 } });
    // spritey.position.set(55, 105, 55);
    // scene.add(spritey);

    // function makeTextSprite(message, parameters) {
    //     if (parameters === undefined) parameters = {};

    //     var fontface = parameters.hasOwnProperty("fontface") ?
    //         parameters["fontface"] : "Arial";

    //     var fontsize = parameters.hasOwnProperty("fontsize") ?
    //         parameters["fontsize"] : 18;

    //     var borderThickness = parameters.hasOwnProperty("borderThickness") ?
    //         parameters["borderThickness"] : 4;

    //     var borderColor = parameters.hasOwnProperty("borderColor") ?
    //         parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

    //     var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
    //         parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 1.0 };


    //     var canvas = document.createElement('canvas');
    //     var context = canvas.getContext('2d');
    //     console.log(context);
    //     context.font = "Bold " + fontsize + "px " + fontface;

    //     // get size data (height depends only on font size)
    //     var metrics = context.measureText(message);
    //     var textWidth = metrics.width;

    //     // background color
    //     context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," +
    //         backgroundColor.b + "," + backgroundColor.a + ")";
    //     // border color
    //     context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," +
    //         borderColor.b + "," + borderColor.a + ")";

    //     context.lineWidth = borderThickness;
    //     roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    //     // 1.4 is extra height factor for text below baseline: g,j,p,q.

    //     // text color
    //     context.fillStyle = "rgba(0, 0, 0, 1.0)";

    //     context.fillText(message, borderThickness, fontsize + borderThickness);

    //     // canvas contents will be used for a texture
    //     var texture = new THREE.Texture(canvas)
    //     texture.needsUpdate = true;

    //     var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    //     var sprite = new THREE.Sprite(spriteMaterial);
    //     sprite.scale.set(100, 50, 1.0);
    //     return sprite;
    // }

    // function roundRect(ctx, x, y, w, h, r) {
    //     ctx.beginPath();
    //     ctx.moveTo(x + r, y);
    //     ctx.lineTo(x + w - r, y);
    //     ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    //     ctx.lineTo(x + w, y + h - r);
    //     ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    //     ctx.lineTo(x + r, y + h);
    //     ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    //     ctx.lineTo(x, y + r);
    //     ctx.quadraticCurveTo(x, y, x + r, y);
    //     ctx.closePath();
    //     ctx.fill();
    //     ctx.stroke();
    // }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    console.log(context);
    const x = 32;
    const y = 32;
    const radius = 60;
    const startAngle = 0;
    const endAngle = Math.PI * 2;

    context.fillStyle = "rgb(110, 110, 110)";
    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle);
    context.fill();

    context.strokeStyle = "rgb(255, 255, 255)";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle);
    context.stroke();

    context.fillStyle = "rgb(255, 255, 255)";
    context.font = "32px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("1", x, y);


    //MATERIALS
    var backgroundMat = createBackgroundMaterial();
    var fingerboardMat = createFingerBoardMaterial();

    //LIGHTS
    createLights();

    //CREATE BACKGROUND PLANE 
    createBackgroundPlane(backgroundMat);

    //LOAD FINGERBOARD
    loadObject ('obj/fingerboard-obj.obj', fingerboardMat);

    //Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    //LOADER
    var loaderDiv = document.getElementById("loader");
    THREE.DefaultLoadingManager.onStart = function() {
        loaderDiv.style.display = 'block';
    };

    THREE.DefaultLoadingManager.onLoad = function() {
        loaderDiv.style.display = 'none';
    };
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
    maps.envCubeMap =  new THREE.CubeTextureLoader()
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

function loadObject (objpath, material) {
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
    sportlightGui.add(spotLight.rotation, 'x', 0, 2*Math.PI);
    sportlightGui.add(spotLight.rotation, 'y', 0, 2*Math.PI);
    sportlightGui.add(spotLight.rotation, 'z', 0, 2*Math.PI);
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