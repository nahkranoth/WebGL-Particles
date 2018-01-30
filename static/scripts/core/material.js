define([], function () {
    return function(name, fragmentShader, vertexShader, color, image_url){
        this.name = name || "unnamed";
        this.fragmentShader = fragmentShader || null;
        this.vertexShader = vertexShader || null;
        this.color = color || [0,0,0,0];
        this.image_url = image_url || null;
        this.image = null;
        this.textureInfo = {};
    }
});
