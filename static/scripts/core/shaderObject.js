define([], function () {
    return function(name, shader, type){
        this.name = name;
        this.shader = shader;
        this.type = type;
    }
});
