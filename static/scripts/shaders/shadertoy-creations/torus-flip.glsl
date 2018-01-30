#version 120




#define MAXIMUM_STEPS 20
#define DISTANCE_THRESHOLD 0.001
#define FAR_CLIP 40.0

const vec3 gwp = vec3(0., -6., 0.); //gravity well position

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

/*DISTANCE FUNCTIONS */

float sdTorus(vec3 rp, vec2 t )
{

  vec2 q = vec2(length(rp.xz)-t.x,rp.y);


  return length(q)-t.y;
}

float sdSphere(vec3 rp, vec3 sp, float r) {
    return length(sp - rp) - r;
}

float nearestSurface(vec3 rp) {

    float msd = 99999.;
    //float gs = abs(sin(iTime)) * 6.; //gravity strength
	float gs = abs(sin(iTime)) * 12.; //this quite interesting


    for (int x = 0; x < 6; x++) {
        for (int z = 0; z < 1; z++) {


                /* Would be nice to do this as a 3 dimensional grid (as seen on telly),
                but performance falls through the floor */

                vec3 sp = vec3(float(x) + sin(iTime), 0., float(z) + .5); //sphere position

                vec2 R = vec2(2.2,.3) + vec2(x*1, 0.);

            	float period = iTime * 2. * 3.1415 * 0.2;

                rX(rp,period+3.1415/2.*float(x) + float(z));
            	rZ(rp,period-3.1415/2.*float(x) + float(z));

                msd = min(msd, sdTorus(rp, R));
        }
    }

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
            //hit scene
            //set colour
            rp.xyz += 6.;
            rp.xyz /= 2.;
            vec4 clr = vec4(1., 1., 1., 1.);

            pc = vec4(rp.x, rp.y, rp.z, 1);
            break;
        }

        if (d > FAR_CLIP) {
            //miss as we've gone past rear clip
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
    vec3 ro = vec3(0, 0, -20);

    //rotate camera
    //rX(ro, iTime * .5);
    //rX(rd, iTime * .5);
    //rY(ro, .5);
    //rY(rd, .5);
    //rZ(ro, .5);
   // rZ(rd, .5);

	fragColor = marchRay(ro, rd);
}

