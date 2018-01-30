#version 120

#define PI 3.14159265359

float plot(vec2 st, float pct){
  return  smoothstep( pct-0.03, pct, st.y) -
          smoothstep( pct, pct+0.03, st.y);
}

void main( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 R = fragCoord.xy - iResolution.xy*0.5;

    vec2 uv = R/iResolution.xy;

    uv -= uv*0.5;

    vec3 color = vec3(1.0, 1., 1.);

    mat2 rot = mat2(cos(iTime+uv.x*2.*PI*3.0), -sin(iTime+uv.y*2.*PI*15.0),
                    sin(iTime+uv.x*2.*PI*3.0), cos(iTime+uv.y*2.*PI*16.0));

    float v = 0.;

    float pct = plot(uv*rot ,v);

    color = pct * color;

	fragColor = vec4(color,1.0);
}
