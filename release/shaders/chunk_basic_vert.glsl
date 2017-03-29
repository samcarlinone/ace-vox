#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define TEXCOORD_LOCATION 2
#define LIGHTING_LOCATION 3

precision highp float;
precision highp int;

uniform mat4 MVP;
uniform vec3 sunVec;
uniform vec3 sunCol;

layout(location = POSITION_LOCATION) in vec3 position;
layout(location = NORMAL_LOCATION) in vec3 normal;
layout(location = TEXCOORD_LOCATION) in vec3 texcoord;
layout(location = LIGHTING_LOCATION) in vec3 lighting;

out vec3 texCoord;
out vec3 lightING;

void main()
{
    texCoord = texcoord;

    if(lighting.x == 32.0)
      lightING = sunCol * abs(dot(sunVec, normal));
    else
      lightING = vec3(lighting.x / 31.0, lighting.y / 31.0, lighting.z / 31.0);
    // lightING = vec3(1.0, 1.0, 1.0);

    gl_Position = MVP * vec4(position, 1.0);
}
