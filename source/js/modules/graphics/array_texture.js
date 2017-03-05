import AceVox from '../game/ace_vox.js';

export class ArrayTexture {

  /**
   * constructor - Creates an arraytexture from a name and array of images
   *
   * @param  {Object} obj {name, imgs:[]}
   * @return {ArrayTexture} this is a constructor
   */
  constructor(obj) {
    var gl = AceVox.gl;

    this.tileSize = obj.imgs[0].width;
    this.tileArea = this.tileSize * this.tileSize;

    //Get smallest power of two that can hold all tiles
    this.numTiles = 2;
    while(this.numTiles * this.numTiles < obj.imgs.length) {
      this.numTiles *= 2;
    }
    this.totalTiles = this.numTiles * this.numTiles;

    //Draw each image and then fill array with data, each image is "strung-out" in final array for webgl
    var can = document.createElement('canvas');
    can.width = can.height = this.tileSize;
    var ctx = can.getContext('2d');

    var pixels = new Uint8Array(this.totalTiles * this.tileArea * 4);

    for(var i=0; i<obj.imgs.length; i++) {
      ctx.drawImage(obj.imgs[i], 0, 0);
      var buffer = ctx.getImageData(0, 0, this.tileSize, this.tileSize).data;

      for(var j=0; j<this.tileArea*4; j++) {
        pixels[i*this.tileArea*4 + j] = buffer[j];
      }
    }

    //Check if we have empty slots
    if(obj.imgs.length < this.totalTiles) {
      for(var i=this.tileArea*4*obj.imgs.length; i<this.totalTiles*this.tileArea*4; i++) {
        pixels[i] = 255;
      }
    }

    this.tex = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.tex);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
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
