#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DArray;

uniform sampler2DArray atlas;
in vec3 texCoord;
in vec3 lightING;

out vec4 color;

void main()
{
    if(texture(atlas, texCoord).a < 0.1)
      discard;

    color = vec4(lightING, 1.0) * texture(atlas, texCoord);
    //color = vec4(1.0, 1.0, 0.0, 0.0);
}
