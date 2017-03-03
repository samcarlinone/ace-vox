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

    this.tileSize = obj.imgs[0].width;

    //Get smallest power of two that can hold all tiles
    this.numTiles = 2;
    while(this.numTiles * this.numTiles < obj.imgs.length) {
      this.numTiles *= 2;
    }
    this.totalTiles = this.numTiles * this.numTiles;

    var can = document.createElement('canvas');
    can.width = can.height = this.tileSize * this.numTiles;

    var ctx = can.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, can.width, can.height);

    for(var y=0; y<this.numTiles; y++) {
      for(var x=0; x<this.numTiles; x++) {
        if((x + y*this.numTiles) < obj.imgs.length) {
          ctx.drawImage(obj.imgs[x + y*this.numTiles], x*this.tileSize, y*this.tileSize);
        } else {
          break;
        }
      }
    }

    var pixels = ctx.getImageData(0, 0, can.width, can.height);
    pixels = new Uint8Array(pixels.data.buffer);

    this.tex = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.tex);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage3D(
        gl.TEXTURE_2D_ARRAY,
        0,
        gl.RGBA,
        this.tileSize,
        this.tileSize,
        this.totalTiles,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels
    );
  }
}
