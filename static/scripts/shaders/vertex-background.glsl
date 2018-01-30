
attribute vec3 aVertexPosition;
attribute vec2 aTexCoords;
attribute vec3 aColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uIndex;

varying vec2 vTexCoord;
varying vec3 vColor;

void main(void) {
    vColor = aColor;
    vTexCoord = aTexCoords;
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
