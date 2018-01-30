define([ "sylvester"], function (sylvester) {
    var Camera = function(name, transform){
        this.name = name || "Camera";
        this.transform = transform || new Transform2D();
    };

    Camera.prototype.Update = function(){
        // this.transform.rotation([this.transform.rx, this.transform.ry + 0.1, this.transform.rz]);
        // this.transform.translation([this.transform.x-0.01, this.transform.y, this.transform.z]);
    };

    //in: Sylvester vector
    Camera.prototype.GetDistance = function(vec){
        var camVecPos = sylvester.$V([this.transform.x, this.transform.y, this.transform.z, 0]);
        return camVecPos.distanceFrom(vec);
    };

    return Camera;
});


