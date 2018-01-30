

attribute vec3 aVertexPosition;
//attribute vec3 aVertexColor;
attribute vec2 aTexCoords;


uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uIndex;

varying vec4 vColor;
varying vec2 vTexCoord;

void main(void) {
    vTexCoord = aTexCoords;
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
