#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DArray;

//uniform sampler2DArray diffuse;
//in vec2 v_st;
out vec4 color;

void main()
{
    //color = texture(diffuse, vec3(v_st, layer));
    color = vec4(1.0, 1.0, 0.0, 0.0);
}
