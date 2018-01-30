define(["underscore","core/gameObject"], function (_, GameObject) {

    var ParticleObject = function(name, material, vertices, transform, uvcoords, color, indices){
        GameObject.call(this, name, material, vertices, transform, uvcoords, color, indices);
    };

    ParticleObject.prototype = Object.create(GameObject.prototype);
    var _super_ = GameObject.prototype;

    ParticleObject.prototype.Update = function(){
        this.transform.rotation([this.transform.rx + 0.01, this.transform.ry + 0.03, this.transform.rz]);
    };

    return ParticleObject;
});
