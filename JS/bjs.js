
//////////////////
// WEB AUDIO API
//////////////////
const audioCtx = new AudioContext();

//Create audio source
//Here, we use an audio file, but this could also be e.g. microphone input
const audioEle = new Audio();
audioEle.src = 'wk.mp3';//insert file name here
audioEle.autoplay = true;
audioEle.preload = 'auto';
const audioSourceNode = audioCtx.createMediaElementSource(audioEle);

//Create analyser node
const analyserNode = audioCtx.createAnalyser();
analyserNode.fftSize = 256;
const bufferLength = analyserNode.frequencyBinCount;
const dataArray = new Float32Array(bufferLength);

//Set up audio node network
audioSourceNode.connect(analyserNode);
analyserNode.connect(audioCtx.destination);

/////////
// BJS
/////////
var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
var createScene = function () {

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    //Camera
    let camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 3,
        Math.PI / 1.7,
        4,
        new BABYLON.Vector3(0, 1, 0),
        scene
    );

    //This targets the camera to scene origin with Y bias: +1
    camera.setTarget(new BABYLON.Vector3(0,1,0));

    // This attaches the camera to the canvas
    camera.attachControl(canvas, false);

    // Some tweaks to limit the zoom and pan
    camera.minZ = 0.1;
    camera.wheelDeltaPercentage = 0.01;
    camera.upperRadiusLimit = 10;
    camera.lowerRadiusLimit = 2;
    camera._panningMouseButton = null;

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    let dlightPosition = new BABYLON.Vector3(0.02, -0.05, -0.05);
    let dLightOrientation = new BABYLON.Vector3(0, 20, 0);


    //Create PBR material
    const pbr = new BABYLON.PBRMaterial("pbr", scene);
    pbr.metallic = 0.0;
    pbr.roughness = 0;      
    pbr.subSurface.isRefractionEnabled = true;
    pbr.subSurface.indexOfRefraction = 1.5;
    pbr.subSurface.tintColor = new BABYLON.Color3(0.0, 0.5, 0.1);

    // The central mesh
    // var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
    var sphere = BABYLON.MeshBuilder.CreateTorusKnot("tk", {radius: 0.3, tube: 0.15, radialSegments: 128});


    // Move the sphere upward 1/2 its height
    sphere.position.y = 1;
    sphere.material = pbr

    //Directional light
    const dLight = new BABYLON.DirectionalLight(
        "dLight",
        dlightPosition,
        scene
    );

    //Directional light orientation
    dLight.position = dLightOrientation;

    //Shadows
    let shadowGenerator = new BABYLON.ShadowGenerator(2048, dLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    
    //Setup environment
    let env = scene.createDefaultEnvironment({
    createSkybox: true,
    skyboxSize: 150,
    skyboxColor: new BABYLON.Color3(0.01,0.01,0.01),
    createGround: true,
    groundSize: 100,
    groundColor: new BABYLON.Color3(0.02,0.02,0.02),
    enableGroundShadow: true,
    groundYBias: 0.975,
    });

    // Code in this function will run ~60 times per second
    scene.registerBeforeRender(function () {



        //Slowly rotate camera
        camera.alpha += (0.0001 * scene.getEngine().getDeltaTime());

        //Set material color
        analyserNode.getFloatFrequencyData(dataArray);
        const sphereColor = ((dataArray[50]**2))/10000;
        console.log(sphereColor);
        pbr.subSurface.tintColor = new BABYLON.Color3(sphereColor, 0.5, 0.1);

        //Set sphere scale
        sphere.scaling.x = sphereColor;
        sphere.scaling.y = sphereColor;
        sphere.scaling.z = sphereColor;

        });



    return scene;
};
                window.initFunction = async function() {
                    
                    
                    var asyncEngineCreation = async function() {
                        try {
                        return createDefaultEngine();
                        } catch(e) {
                        console.log("the available createEngine function failed. Creating the default engine instead");
                        return createDefaultEngine();
                        }
                    }

                    window.engine = await asyncEngineCreation();
        if (!engine) throw 'engine should not be null.';
        startRenderLoop(engine, canvas);
        window.scene = createScene();};
        initFunction().then(() => {sceneToRender = scene                    
        });

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });