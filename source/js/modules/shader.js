import AceVox from './ace_vox.js';

export class Shader {

  /**
   * constructor - Creates a shader from two strings
   *
   * @param  {string} vs_src Vertex Shader source string
   * @param  {string} fg_src Fragment Shader source string
   * @return {Shader} this is a constructor
   */
  constructor(vs_src, fg_src) {
    var vert = this.compileShader(AceVox.gl, vs_src, AceVox.gl.VERTEX_SHADER);
    var frag = this.compileShader(AceVox.gl, fg_src, AceVox.gl.FRAGMENT_SHADER);

    this.program = this.createProgram(AceVox.gl, vert, frag);
  }

  /**
   * Creates and compiles a shader.
   *
   * @param {!WebGLRenderingContext} gl The WebGL Context.
   * @param {string} shaderSource The GLSL source code for the shader.
   * @param {number} shaderType The type of shader, VERTEX_SHADER or FRAGMENT_SHADER.
   * @return {!WebGLShader} The shader.
   */
  compileShader(gl, shaderSource, shaderType) {
    // Create the shader object
    var shader = gl.createShader(shaderType);

    // Set the shader source code.
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check if it compiled
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      // Something went wrong during compilation; get the error
      throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }

    return shader;
  }

  /**
   * Creates a program from 2 shaders.
   *
   * @param {!WebGLRenderingContext) gl The WebGL context.
   * @param {!WebGLShader} vertexShader A vertex shader.
   * @param {!WebGLShader} fragmentShader A fragment shader.
   * @return {!WebGLProgram} A program.
   */
  createProgram(gl, vertexShader, fragmentShader) {
    // create a program.
    var program = gl.createProgram();

    // attach the shaders.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // link the program.
    gl.linkProgram(program);

    // Check if it linked.
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        // something went wrong with the link
        throw ("program filed to link:" + gl.getProgramInfoLog (program));
    }

    return program;
  }
}
