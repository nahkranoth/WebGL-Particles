precision mediump float;

varying vec2 vTexCoord;
varying float vTime;
varying vec3 vColor;

uniform sampler2D uTexture;

void main(void) {
     vec4 img = texture2D(uTexture, vTexCoord);
//     vec4 clr = vec4(vColor, 1) * sin(vTime)*0.5+0.5;
     vec4 clr = vec4(vColor, 1);
     gl_FragColor = clr * img;

}
