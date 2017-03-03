#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DArray;

uniform sampler2DArray atlas;
in vec3 texCoord;

out vec4 color;

void main()
{
    color = texture(atlas, texCoord);
    //color = vec4(1.0, 1.0, 0.0, 0.0);
}
