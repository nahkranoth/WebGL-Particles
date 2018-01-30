attribute vec3 aVertexPosition;
attribute vec2 aTexCoords;
attribute vec3 aColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uTime;

varying vec2 vTexCoord;
varying float vTime;
varying vec3 vColor;

void main(void) {
    vTexCoord = aTexCoords;
    vTime = uTime;
    vColor = aColor;

//    mat4 tMat = mat4(
//            1.0, 0.0, 0.0, 0.,
//            0.0, 1.0, 0.0, 0.,
//            0.0, 0.0, 1.0, 0.,
//            0.0, 0.0, 1.0, 1.0
//        );
// In shader matrix transform example
//    gl_Position = uPMatrix * tMat * uMVMatrix *  vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
    gl_Position = uPMatrix * uMVMatrix *  vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
}
