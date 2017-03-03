#version 300 es
#define POSITION_LOCATION 0
#define TEXCOORD_LOCATION 4

precision highp float;
precision highp int;

uniform mat4 MVP;

layout(location = POSITION_LOCATION) in vec3 position;
layout(location = TEXCOORD_LOCATION) in vec3 texcoord;

out vec3 texCoord;

void main()
{
    texCoord = texcoord;
    gl_Position = MVP * vec4(position, 1.0);
}
