define(["underscore", "sylvester", "core/transform2D"], function (_, sylvester, Transform2D) {
    var RenderManager = {

         vertexAttributes: [],

        initEngine : function(canvas, width, height, camera){
            this.width = width;
            this.height = height;
            canvas.width  = this.width;
            canvas.height = this.height;
            this.camera = camera;

            this.gl = null;
            this.objectList = [];

            // Try to grab the standard context. If it fails, fallback to experimental.
            this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            this.gl.enable ( this.gl.BLEND) ;
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

            // If we don't have a GL context, give up now
            if (!this.gl) {
                alert('Unable to initialize WebGL. Your browser may not support it.');
                return;
            }

            // Set clear color to black, fully opaque
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            // Enable depth testing
            this.gl.enable(this.gl.DEPTH_TEST);
            // this.gl.disable(this.gl.DEPTH_TEST);
            // Near things obscure far things
            this.gl.depthFunc(this.gl.LESS);
            // Clear the color as well as the depth buffer.
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            // this.gl.enable(this.gl.CULL_FACE);
            // this.gl.cullFace(this.gl.BACK);

            this.projectionMatrix = sylvester.makePerspective(45, this.width/this.height, 0.1, 100.0);
        },

        setProgram : function(object){
            object.shaderProgram = this.gl.createProgram();
            this.gl.attachShader(object.shaderProgram, object.fragmentShader.shader);
            this.gl.attachShader(object.shaderProgram, object.vertexShader.shader);
            this.gl.linkProgram(object.shaderProgram);
            this.gl.useProgram(object.shaderProgram);
        },

        setAttributes: function(object){
            this.setVertexAttributes(object);
            this.objectList.push(object);
            object.renderIndex = this.objectList.length - 1;

            //refactor
            this.setMatrixUniforms(object, this.projectionMatrix, "uPMatrix");
        },
        setVertexAttributes: function(object){
            var gl = this.gl;

            vertexAttributes = [
                {name:"aVertexPosition", size:3, data:new Float32Array(object.mesh.vertices), type:this.gl.ARRAY_BUFFER, addToShader:true},
                {name:"indices", size:3, data:new Uint16Array(object.mesh.indices), type:this.gl.ELEMENT_ARRAY_BUFFER, addToShader:false},
                {name:"aTexCoords", size:2, data:new Float32Array(object.mesh.uvcoords), type:this.gl.ARRAY_BUFFER, addToShader:true},
                {name:"aColor", size:3, data:new Float32Array(object.color), type:this.gl.ARRAY_BUFFER, addToShader:true}

                // {name:"aRandomFloat", size:1, data:Math.random(), type:this.gl.FLOAT}
            ];

            for(var i=0;i<vertexAttributes.length;i++){
                this.setAttribute(vertexAttributes[i], object);
            }

        },
        setAttribute: function(attribute, object){
            var gl = this.gl;
            attribute.buffer = gl.createBuffer();

            if(attribute.addToShader) {
                attribute.vertAttribute = this.gl.getAttribLocation(object.shaderProgram, attribute.name);
                gl.enableVertexAttribArray(attribute.vertAttribute);
                gl.vertexAttribPointer(attribute.vertAttribute, attribute.size, gl.FLOAT, false, 0, 0);
            }

            gl.bindBuffer(attribute.type, attribute.buffer);
            gl.bufferData(attribute.type, attribute.data, gl.STATIC_DRAW);
            // gl.bufferData(attribute.type, new Uint16Array(indices), gl.STATIC_DRAW);

            object.renderAttributes.push(attribute);
        },

        setVertexZRenderOrder: function(vertices, indices_data, transform){
            var indices = indices_data.data;
            var distanceVerts = [];

            for(var i = 0;i<indices.length/indices_data.size;i++){

                var step = i * indices_data.size;

                var c_indice_a = indices[step];
                var c_indice_b = indices[step + 1];
                var c_indice_c = indices[step + 2];

                var index_a = c_indice_a * vertices.size;
                var index_b = c_indice_b * vertices.size;
                var index_c = c_indice_c * vertices.size;

                var a = sylvester.$V([
                    vertices.data[ index_a ],
                    vertices.data[ index_a + 1 ],
                    vertices.data[ index_a + 2 ]
                ]);

                var b = sylvester.$V([
                    vertices.data[ index_b ],
                    vertices.data[ index_b + 1 ],
                    vertices.data[ index_b + 2 ]
                ]);

                var c = sylvester.$V([
                    vertices.data[ index_c ],
                    vertices.data[ index_c + 1 ],
                    vertices.data[ index_c + 2 ]
                ]);

                var center = a.add(b).add(c).multiply(0.33333);
                center = new Transform2D(center.elements[0], center.elements[1], center.elements[2]);

                mvMatrix = sylvester.Matrix.I(4);

                var mvPos = transform.getTransAsVec(true).add(center.getTransAsVec(true));
                var camera_distance = this.camera.GetDistance( mvPos );

                distanceVerts.push({indices:[c_indice_a, c_indice_b, c_indice_c], distance:camera_distance});
            }

            var distanceSorted = _.sortBy(distanceVerts, "distance");
            var result = [];

            //TODO: It's scrambling the order of the indices

            //TODO: To clearup what's going wrong; pass distance to indices and turn into a color for the vert shader

            for(var j=distanceSorted.length-1;j>=0;j--){
                result.push({distance:distanceSorted[j].distance, indices:distanceSorted[j].indices});
            }
            return result;
        },

        getFlattenedIndices: function(array){
            result = [];
            var indices_list = [];
            for(var i=0;i<array.length;i++){
                indices_list.push(array[i].indices[0]);
                indices_list.push(array[i].indices[1]);
                indices_list.push(array[i].indices[2]);
            }
            return new Uint16Array(_.flatten(indices_list));
        },

        getSortedColors: function(array){
            // return a list of colors build up by distance ->
            // it should be colors distance based on the original vertices
            // Take distance -> Take pointing indices -> Build a color based on this distance
            //
        },

        orderObjectsByDistance: function(objects){
            var distances = [];
            for(var i=0;i<objects.length;i++){
                var item = objects[i];
                var item_pos = item.mvMatrix.multiply( item.transform.getTransAsVec(true) );
                var camera_distance = this.camera.GetDistance( item_pos );
                distances.push({obj:item, distance:camera_distance});
            }

            var distanceSorted = _.sortBy(distances, "distance");
            var result = [];
            for(var j=0;j<distanceSorted.length;j++){
                result.push(distanceSorted[j].obj);
            }
            return result.reverse();
        },

        drawScene : function(currentTime){

            var gl = this.gl;
            gl.clearColor(0.2,0.4,0.3,1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //Pre-process all objects before rendering
            for(var k=0;k<this.objectList.length;k++){
                //Order matters
                var obj = this.objectList[k];
                obj.mvMatrix = sylvester.Matrix.I(4);
                obj.mvMatrix = this.mvTranslate(obj.mvMatrix, this.camera.transform, true);
                obj.mvMatrix = this.mvTranslate(obj.mvMatrix, obj.transform, false);
            }

            this.objectList = this.orderObjectsByDistance(this.objectList);

            for(var i=0;i<this.objectList.length;i++){

                var obj = this.objectList[i];
                gl.useProgram(obj.shaderProgram);

                //TODO: for optimisation batch re-use program if previous object also used it

                this.setMatrixUniforms(obj, obj.mvMatrix, "uMVMatrix");
                this.setFloatUniform(obj, currentTime * 0.001, "uTime");

                var indices = _.find(obj.renderAttributes, function(x){ return x.name == "indices"; });
                //preprocess indices order

                var sorted_indices = this.setVertexZRenderOrder(
                    _.find(obj.renderAttributes, function(x){ return x.name == "aVertexPosition"; }),
                    indices,
                    obj.transform
                    );
                indices.data = this.getFlattenedIndices(sorted_indices);

                // color.data = this.getSortedColors(sorted_indices);//FOR DEBUG REASONS

                //DO NOT REMOVE; NEEDED FOR SWITCHING SHADERS DURING RUNTIME
                for(var j=0;j<obj.renderAttributes.length;j++){
                    gl.bindBuffer(obj.renderAttributes[j].type, obj.renderAttributes[j].buffer);
                    gl.bufferData(obj.renderAttributes[j].type, obj.renderAttributes[j].data, gl.STATIC_DRAW);
                    gl.vertexAttribPointer(obj.renderAttributes[j].vertAttribute, obj.renderAttributes[j].size, gl.FLOAT, false, 0, 0);
                }

                //NOTE: for a particle engine drawArrays might be faster
                // gl.drawArrays(gl.LINE_LOOP, 0, obj.vertices.length/3 );
                gl.drawElements(gl.TRIANGLES, obj.mesh.indices.length, gl.UNSIGNED_SHORT, 0)
            }
        },

        setFloatUniform: function(object, val, type){
            var gl = this.gl;
            var pVal = gl.getUniformLocation(object.shaderProgram, type);
            gl.uniform1f(pVal, val);
        },

        setMatrixUniforms : function(object, matrix, type) {
            var gl = this.gl;
            var mvUniform = gl.getUniformLocation(object.shaderProgram, type);
            gl.uniformMatrix4fv(mvUniform, false, new Float32Array(matrix.flatten()));
        },

        mvTranslate : function(matrix, transform, inverse) {
            var result;
            var r = [transform.rx, transform.ry, transform.rz];

            if (inverse){
                result = matrix.x(sylvester.Matrix.Translation( transform.getTransAsVec(false) ).inverse().ensure4x4());
                result = result.x(sylvester.Matrix.RotationX(r[0]).ensure4x4().inverse());
                result = result.x(sylvester.Matrix.RotationY(r[1]).ensure4x4().inverse());
                result = result.x(sylvester.Matrix.RotationZ(r[2]).ensure4x4().inverse());
                return result;
            }

            result = matrix.x(sylvester.Matrix.Translation( transform.getTransAsVec(false) ).ensure4x4());
            result = result.x(sylvester.Matrix.RotationX(r[0]).ensure4x4());
            result = result.x(sylvester.Matrix.RotationY(r[1]).ensure4x4());
            result = result.x(sylvester.Matrix.RotationZ(r[2]).ensure4x4());
            return result;

            //TODO: Implement scale transformation
            //TODO: Quaternions
        }
    };

    return RenderManager;
});
