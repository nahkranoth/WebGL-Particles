define([
    "jquery",
    "underscore",
    "core/renderManager",
    "core/shaderObject"
], function (
    $,
    _,
    renderManager,
    shaderObject
) {
    var ShaderManager = {

        allShaders : [],

        onReadyCallback : null,

        init : function(){
            this.toLoadShaders = [
                new ShaderLoadObject(
                    "/static/scripts/shaders/fragment-solid.glsl",
                    _.bind(this.onShaderLoaded, this),
                    renderManager.gl.FRAGMENT_SHADER,
                    "solid-fragment"
                ),
                new ShaderLoadObject(
                    "/static/scripts/shaders/fragment-blue.glsl",
                    _.bind(this.onShaderLoaded, this),
                    renderManager.gl.FRAGMENT_SHADER,
                    "solid-fragment-blue"
                ),
                new ShaderLoadObject(
                    "/static/scripts/shaders/fragment-background.glsl",
                    _.bind(this.onShaderLoaded, this),
                    renderManager.gl.FRAGMENT_SHADER,
                    "solid-fragment-background"
                ),
                new ShaderLoadObject(
                    "/static/scripts/shaders/fragment-image.glsl",
                    _.bind(this.onShaderLoaded, this),
                    renderManager.gl.FRAGMENT_SHADER,
                    "solid-fragment-image"
                ),
                new ShaderLoadObject(
                    "/static/scripts/shaders/vertex.glsl",
                    _.bind(this.onShaderLoaded, this),
                    renderManager.gl.VERTEX_SHADER,
                    "simple-vertex"
                ),
                new ShaderLoadObject(
                    "/static/scripts/shaders/vertex-background.glsl",
                    _.bind(this.onShaderLoaded, this),
                    renderManager.gl.VERTEX_SHADER,
                    "simple-vertex-background"
                ),
                new ShaderLoadObject(
                    "/static/scripts/shaders/vertex-image.glsl",
                    _.bind(this.onShaderLoaded, this),
                    renderManager.gl.VERTEX_SHADER,
                    "simple-vertex-image"
                )
            ];
        },

        loadAllShaders : function(callback){
            this.onReadyCallback = callback;
            _.each(this.toLoadShaders, function(s){
                this.getShader(s);
            }.bind(this));
        },

        allShadersLoaded : function(){
            this.onReadyCallback();
        },

        findShader : function(name){
            return _.find(this.allShaders, function(s){ return s.name == name;});
        },

        getShader : function(obj){
            $.get(obj.path, function(data){
                obj.callback(obj.name, data, obj.type);
            });
        },

        prepareShader : function(source, type){
            var shader = renderManager.gl.createShader(type);
            renderManager.gl.shaderSource(shader, source);
            renderManager.gl.compileShader(shader);

            if (!renderManager.gl.getShaderParameter(shader, renderManager.gl.COMPILE_STATUS)) {
                console.log('An error occurred compiling the shaders: ' + renderManager.gl.getShaderInfoLog(shader));
                renderManager.gl.deleteShader(shader);
                return null;
            }
            return shader;
        },

        onShaderLoaded : function(name, source, type){
            var preparedShader = this.prepareShader(source, type);
            var shader = new shaderObject(name, preparedShader, type);
            this.allShaders.push(shader);

            if(this.allShaders.length == this.toLoadShaders.length){ //replace 2 with amount of shaders initial wanting to load
                this.allShadersLoaded();
            }
        }
    };

    function ShaderLoadObject(path, callback, type, name) {
        this.name = name;
        this.path = path;
        this.callback = callback;
        this.type = type;
    }

    return ShaderManager;

});
