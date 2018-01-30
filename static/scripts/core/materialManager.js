define([
    "jquery",
    "underscore",
    "core/material",
    "core/shaderManager",
    "core/renderManager"
], function (
    $,
    _,
    material,
    shaderManager,
    renderManager
) {
    var MaterialManager = {

        allMaterials: [],
        toLoadMaterials: [],
        onReadyCallback : null,
        loadAllMaterials : function(materials, callback){
            this.onReadyCallback = callback;
            this.toLoadMaterials = [];

            _.each(materials, function(s){
                if(!s.image_url){
                    this.allMaterials.push(s);
                    this.toLoadMaterials.push(s);
                    return;
                }

                var imgLObj = new imageLoadObject(s);
                this.toLoadMaterials.push(imgLObj);
                this.downloadImage(imgLObj);
            }.bind(this));

        },
        downloadImage: function(obj){
            var gl = renderManager.gl;

            obj.material.image = new Image();

            var tex = gl.createTexture();

            var textureInfo = {
                width: 1,   // we don't know the size until it loads
                height: 1,
                texture: tex
            };

            obj.material.image.addEventListener('load', _.bind(function() {

                textureInfo.width = obj.material.image.width;
                textureInfo.height = obj.material.image.height;

                gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, obj.material.image);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

                this.allMaterials.push(obj.material);
                if(this.allMaterials.length == this.toLoadMaterials.length){ //replace 2 with amount of shaders initial wanting to load
                    this.allMaterialsLoaded();
                }
            }, this));

            obj.material.image.src = obj.material.image_url;
        },

        allMaterialsLoaded : function(){
            this.onReadyCallback();
        },

        findMaterial : function(name){
            var result =  _.find(this.allMaterials, function(s){ return s.name == name;});
            if(!result) console.log("Could not find material: "+name);
            return result;
        }
    };

    function imageLoadObject(material){
        this.material = material;
    }

    return MaterialManager;

});
