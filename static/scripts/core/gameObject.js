define(["core/transform2D"], function (Transform2D) {
     var GameObject = function(name, material, mesh, transform, color){
        this.name = name || "Untitled";
        this.material = material;
        this.fragmentShader = material.fragmentShader || shaderManager.findShader("solid-fragment");
        this.vertexShader = material.vertexShader || shaderManager.findShader("simple-vertex");
        this.mesh = mesh || {};
        this.color = color || [];
        this.transform = transform || new Transform2D();
        this.shaderProgram = null;
        this.renderAttributes = [];
        this.mvMatrix = null;
    };

    GameObject.prototype.Update = function(){

    };

     GameObject.prototype.init = function(){
         console.log("Test");
     };


    return GameObject;
});


