define([
    "underscore",
    "sylvester-ext",
    "sylvester",
    "core/shaderManager",
    "core/renderManager",
    "core/materialManager",
    "core/gameObject",
    "core/transform2D",
    "core/camera",
    "core/particleObject",
    "core/mesh",
    "core/material",
    "core/GLHelpers"
],
    function (
        _,
        sylvester_ext,
        sylvester,
        shaderManager,
        renderManager,
        materialManager,
        gameObject,
        Transform2D,
        Camera,
        particleObject,
        mesh,
        material,
        GLhelpers
    ) {

    var SceneManager = {

        init : function () {
            console.log("Init SceneManager2 1.0");

            this.currentTime = 0;
            this.startTime = (new Date()).getTime();
            this.deltaTime = 0;
            this.lastTime = 0;

            this.sceneObjects = [];

            this.camera = new Camera("Camera", new Transform2D(0,0,0));

            renderManager.initEngine(document.getElementById("myCanvas"), 640, 480, this.camera);
            shaderManager.init();//todo pass all active shaders
            shaderManager.loadAllShaders(_.bind(this.allShadersLoaded, this));//TODO: Better Event system then just callbacks

        },
        allShadersLoaded: function(){
            materialManager.loadAllMaterials([
                new material(
                    "default-white",
                    shaderManager.findShader("solid-fragment"),
                    shaderManager.findShader("simple-vertex"),
                    [0,1,1,1]
                ),
                new material(
                    "background-image",
                    shaderManager.findShader("solid-fragment-background"),
                    shaderManager.findShader("simple-vertex-background"),
                    [0,1,1,1]
                ),
                new material(
                    "default-image",
                    shaderManager.findShader("solid-fragment-image"),
                    shaderManager.findShader("simple-vertex-image"),
                    [0,0,1,1],
                    "static/images/sphere.jpeg"
                )
            ], _.bind(this.makeScene, this));
        },
        makeScene : function () {

            var cubeMesh = new mesh(
                "Cube_Mesh",
                GLhelpers.primitives.cube.vertices,
                GLhelpers.primitives.cube.uv,
                GLhelpers.primitives.cube.indices
            );

            // Change for working extending behaviour
            var cubeObject = new particleObject(
                "cube",
                materialManager.findMaterial("default-image"),
                cubeMesh,
                new Transform2D(3, 0, -6),
                GLhelpers.primitives.cube.color

            );

            this.sceneObjects.push(cubeObject);

            // Change for working extending behaviour
            var cubeObject2 = new particleObject(
                "cube2",
                materialManager.findMaterial("default-image"),
                cubeMesh,
                new Transform2D(0, 0, -22),
                GLhelpers.primitives.cube.color
            );

            this.sceneObjects.push(cubeObject2);

            // Change for working extending behaviour
            var cubeObject3 = new particleObject(
                "cube3",
                materialManager.findMaterial("default-image"),
                cubeMesh,
                new Transform2D(-5, 0, -13),
                GLhelpers.primitives.cube.color
            );

            this.sceneObjects.push(cubeObject3);

            for (var i = 0; i < this.sceneObjects.length; i++) {
                renderManager.setProgram(this.sceneObjects[i]);
                renderManager.setAttributes(this.sceneObjects[i]);
            }

            window.requestAnimationFrame(_.bind(this.run, this));
        },

        run : function () {
            window.requestAnimationFrame(_.bind(this.run, this));

            this.currentTime = (new Date()).getTime();
            this.pastTime = this.currentTime - this.startTime;
            // this.deltaTime = (this.currentTime - this.lastTime) / 1000; time between last frame

            //TODO: Better Event system then just callbacks
            //Update Camera
            this.camera.Update();

            //Object Update
            for (var j = 0; j < this.sceneObjects.length; j++) {
                var currentObject = this.sceneObjects[j];
                currentObject.Update();
            }

            renderManager.drawScene(this.pastTime);

            this.lastTime = this.currentTime;
        }

    };
    return SceneManager;
});
