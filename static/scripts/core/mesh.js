define([], function () {
    var Mesh = function(name, vertices, uvcoords, indices){
        this.name = name || "Untitled";
        this.vertices = vertices || [];
        this.uvcoords = uvcoords || [];
        this.indices = indices|| [];
    };

    // Mesh.prototype.Update = function(){
    //
    // };

    return Mesh;
});


