$(document).ready(function() {

    "use strict";
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    let camera;
    let controls;
    let scene;
    let renderer;

    let meshDistance;
    let fbGroup;
    let linesGroup;

    let lines = [];
    let pos = {
        lineFir: [],
        lineSec: [],
        ann: []
    };

    const selectors = ['.sloper30', '.sloper20', '.jugL', '.jugC',
        '.fingPock2', '.fingPock3', '.fingPock4',
        '.fingCrimp4', '.fingCrimp3', '.fingCrimp2'
    ];

    init();

    $('#ann').hide();
    $('.showOrNot').on('click', hideShow);

    function hideShow() {
        let text = $('.showOrNot').text();
        $('.showOrNot').text(text == 'Show Annotaions' ? 'Hide Annotaions' : 'Show Annotaions');
        $('#ann').toggle();
        linesGroup.visible = linesGroup.visible ? false : true;
    }

    animate();


    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(35, 10 / 5, 1, 2000); //5/3 ratio corresponds to the 0.6 width/height canvas container padding
        scene.add(camera);
        camera.position.set(-50, 0, 750);

        //RENDER
        renderer = createRenderer(0x222222);
        const parent = document.getElementById('canvasContainer');
        parent.appendChild(renderer.domElement);

        // Empty Group
        fbGroup = createfbGroup(0, -75, 0);
        meshDistance = camera.position.distanceTo(fbGroup.position);

        //
        linesGroup = new THREE.Object3D;
        fbGroup.add(linesGroup);

        if (screen.width > 992) {
            // lines
            pos.lineFir = [
                [-165, 134, 34], // 30 sloper
                [-83, 141, 34], //20 sloper
                [0, 68, 55], // large Jug
                [0, 24, 40], // central Jug
                [-91, 68, 55], // 2 Finger Pocket
                [-161, 68, 55], // 3 Finger Pocket
                [-253, 68, 55], // 4 Finger Pocket
                [-103, 25, 40], // 2 Finger Cripm
                [-188, 25, 40], // 3 Finger Cripm
                [-270, 25, 40] // 4 Finger Cripm
            ];
            const difference = [10, 10, 20];
            for (let i = 0; i < pos.lineFir.length; i++) {
                const d0 = pos.lineFir[i][0] + difference[0];
                const d1 = pos.lineFir[i][1] + difference[1];
                const d2 = pos.lineFir[i][2] + difference[2];

                pos.lineSec.push([d0, d1, d2]);
                pos.ann.push([d0, d1 - 75, d2]);

                lines[i] = createLine(pos.lineFir[i], pos.lineSec[i]);
            }
        } else { linesGroup.visible = false }

        //MATERIALS
        // const backgroundMat = createBackgroundMaterial();  // no background
        const fingerboardMat = createFingerBoardMaterial();

        //LIGHTS
        createLights();

        // CREATE BACKGROUND PLANE
        // createBackgroundPlane(backgroundMat);  // no background

        //LOAD FINGERBOARD
        let fingerb = loadObject('obj/fingerboard-obj.obj', fingerboardMat, fbGroup);
        // console.log('fingerb is ', fingerb); // fingerb is undefined ?

        //Controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);

        //LOADER
        loadingScreen(fbGroup);

    }

    // end of init()



    // FUNCTIONS

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

    // function createBackgroundPlane(material) {
    //     var geometry = new THREE.PlaneGeometry(3000, 3000);
    //     var plane = new THREE.Mesh(geometry, material);
    //     plane.position.set(0, 0, -1400);
    //     camera.add(plane);

    //     return plane;
    // }

    function createfbGroup(x, y, z) {
        const fbGroup = new THREE.Object3D;
        fbGroup.name = 'fingerboard group';
        fbGroup.position.set(x, y, z);
        fbGroup.rotation.set(0, 0, 0);
        fbGroup.visible = false;
        scene.add(fbGroup);

        return fbGroup;
    }

    // Line 
    function createLine(fp, sp) {
        const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.4, linecap: 'round' });
        let geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(fp[0], fp[1], fp[2]));
        geometry.vertices.push(new THREE.Vector3(sp[0], sp[1], sp[2]));
        let line = new THREE.Line(geometry, material);
        line.visible = false;
        linesGroup.add(line);

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
            function(xhr) {
                let loadPercent = Math.round(xhr.loaded / xhr.total * 100);
                $('.percent').text(loadPercent);
            },
            function(error) {
                console.log('An error happened');
            }
        );
    }

    function loadingScreen(fbGroup) {
        const loaderDiv = document.getElementById('loader');
        THREE.DefaultLoadingManager.onStart = function() {
            loaderDiv.style.display = 'block';
        };
        THREE.DefaultLoadingManager.onLoad = function() {
            loaderDiv.style.display = 'none';
            $('#ann').show();
            fbGroup.visible = true;
        };
    }

    //FUNCTION FOR CREATING RENDERER
    function createRenderer(clearColour) {
        let myRenderer;
        myRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        myRenderer.shadowMap.enabled = true; //enabling shadow maps in the renderer
        myRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        myRenderer.setClearColor(clearColour, 0);
        myRenderer.setSize(window.innerWidth, window.innerHeight);

        return myRenderer;
    }

    function updateScreenPosition(annPos, meshDist, selects) {
        let ann;
        let canvas = renderer.domElement;

        annPos.map((p, i) => {
            if (lines.length > 0) {
                const vec = new THREE.Vector3(p[0], p[1], p[2]);
                const vec2 = new THREE.Vector3(p[0], p[1] - 27, p[2]);
                let spritesBehindObject;

                // Annotation position
                vec.project(camera);
                vec.x = Math.round((0.5 + vec.x / 2) * (canvas.clientWidth / window.devicePixelRatio));
                vec.y = Math.round((0.5 - vec.y / 2) * (canvas.clientHeight / window.devicePixelRatio)); //changed from canvas.height to canvas.clienntHeight

                ann = document.querySelector(selects[i]);
                ann.style.top = `${vec.y}px`;
                ann.style.left = `${vec.x}px`;

                // opacity
                let spriteDistance = camera.position.distanceTo(vec2);
                spritesBehindObject = spriteDistance > meshDist;
                ann.style.opacity = spritesBehindObject ? 0.1 : 1;

                lines[i].visible = spritesBehindObject ? false : true;
            }
        });
    }


    function animate() {
        window.requestAnimationFrame(animate);
        render(controls, scene, camera, pos.ann, meshDistance, selectors);
    }

    function render(ctrls, sc, cam, ann, meshDist, selects) {
        ctrls.update(); // moved from animate fn
        renderer.render(sc, cam);
        updateScreenPosition(ann, meshDist, selects);
    }

});