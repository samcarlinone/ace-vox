import AceVox from './ace_vox.js';
import TextureCache from './texture_cache.js';

export class ArrayTexture {

  /**
   * constructor - Creates a shader from two strings
   *
   * @param  {Object} obj {name, imgs:[]}
   * @return {ArrayTexture} this is a constructor
   */
  constructor(obj) {
    var gl = AceVox.gl;
    console.log(obj);
    window.obj = obj;

    // this.tex = gl.createTexture();
    //
    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.tex);
    // gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texImage3D(
    //     gl.TEXTURE_2D_ARRAY,
    //     0,
    //     gl.RGBA,
    //     IMAGE_SIZE.width,
    //     IMAGE_SIZE.height,
    //     NUM_IMAGES,
    //     0,
    //     gl.RGBA,
    //     gl.UNSIGNED_BYTE,
    //     pixels
    // );
  }
}
