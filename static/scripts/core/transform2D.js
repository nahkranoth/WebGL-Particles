define(["sylvester"], function (sylvester) {
    return function(x, y, z, w, h, rx, ry, rz){
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.width = w || 0;
        this.height = h || 0;
        this.rx = rx || 0;
        this.ry = ry || 0;
        this.rz = rz || 0;

        this.translation = function(v){
            this.x = v[0];
            this.y = v[1];
            this.z = v[2];
        };

        this.rotation = function(v){
            this.rx = v[0];
            this.ry = v[1];
            this.rz = v[2];
        };

        this.scale = function(v){
            this.width = v[0];
            this.height = v[1];
        };

        this.getTransAsVec = function(addW){
            if(addW) return sylvester.$V([this.x, this.y, this.z, 0]);

            return sylvester.$V([this.x, this.y, this.z]);
        }
    }
});



