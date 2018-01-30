#version 120




#define MAXIMUM_STEPS 1290
#define DISTANCE_THRESHOLD 1.
#define FAR_CLIP 120.0


float sdPlane( vec3 p, vec4 n )
{
  // n must be normalized
  return dot(p,n.xyz) + n.w;
}

float opDisplace( vec3 p, vec4 t )
{
    float d1 = sdPlane(p, t);
    float d2 = (sin(.9*p.x)*0.5-1.)*(sin(.9*p.y)*0.5-1.);
    float d3 = (sin(.9*p.x+sin(p.z))*0.5-1.)*.2;
    return d1+d3;
}

/* ROTATIONS */

void rX(inout vec3 p, float a) {
    vec3 q = p;
    float c = cos(a);
    float s = sin(a);
    p.y = c * q.y - s * q.z;
    p.z = s * q.y + c * q.z;
}

void rY(inout vec3 p, float a) {
    vec3 q = p;
    float c = cos(a);
    float s = sin(a);
    p.x = c * q.x + s * q.z;
    p.z = -s * q.x + c * q.z;
}

void rZ(inout vec3 p, float a) {
    vec3 q = p;
    float c = cos(a);
    float s = sin(a);
    p.x = c * q.x - s * q.y;
    p.y = s * q.x + c * q.y;
}

float nearestSurface(vec3 rp) {

    float msd = 99999.;
    vec4 plo = vec4(.0,.2,.0,.0);

    float orientation = 0.2;
    msd = min(msd, opDisplace(rp, plo));

    return msd;
}

/* RAY MARCHING */

//march a single ray
vec4 marchRay(vec3 ro, vec3 rd) {

    float d = 0.0; //distance marched
    vec4 pc = vec4(0.); //pixel colour

    for (int i = 0; i < MAXIMUM_STEPS; ++i) {

        vec3 rp = ro + rd * d; //ray position
        float ns = nearestSurface(rp);
        d += ns;

        if (ns < DISTANCE_THRESHOLD) {
            rp.xyz += 12.;
            rp.xyz /= 8.;
            vec4 clr = vec4(1.);

            pc = vec4(sin(rp.x), sin(rp.y), sin(rp.z), 1)*clr;
            break;
        }

        if (d > FAR_CLIP) {
            pc = vec4(0.1, 0.3, 0.9, 1.);
            pc *= 1.-smoothstep(0.02, 0.33, rd.y) + 0.8;
            break;
        }
    }

    return pc;
}

void main(out vec4 fragColor, in vec2 fragCoord) {

    vec2 uv = fragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    //camera
    vec3 rd = normalize(vec3(uv, 2.));
    vec3 ro = vec3(0, 7, -40.+float(iFrame)/15.);

    rY(ro, -cos(iTime) * .06);
    rY(rd, sin(iTime) * .2);

	fragColor = marchRay(ro, rd);
}

