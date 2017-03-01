//Copied from blocks.js
var Blocks = [
  {
    name: 'DIRT',
    cube: true,
    texId: 0
  }
];

const AIR = 0b1000000000000000;


/**
 * Passed in chunk data to convert to meshes
 *
 * @param  {Object} msg id, and dat {Uint16Array} members
 * @return {Object}     contains id, as well as pos, tex {Float32Array} members
 */
self.onmessage = function(msg) {
  var pos = [];
  var tex = [];

  for(var x=0; x<64; x++) {
    for(var y=0; y<64; y++) {
      for(var z=0; z<64; z++) {
        var p = x + y*64 + z*4096;
        //Check if not air
        if(msg.dat[p] < AIR) {
          //Check if cube with face unneeded or custom mesh
          if(Blocks[msg.dat[p]].cube) {
              //Check all faces

              //Top
              if(z == 63 || msg.dat[p + 4096] >= AIR) {
                pos = pos.concat([
                    x,   y, z+1,
                  x+1,   y, z+1,
                  x+1, y+1, z+1,

                    x,   y, z+1,
                  x+1, y+1, z+1,
                    x, y+1, z+1,
                ]);

                tex = tex.concat([
                  0, 0, Blocks[msg.dat[p]].texId,
                  1, 0, Blocks[msg.dat[p]].texId,
                  1, 1, Blocks[msg.dat[p]].texId,

                  0, 0, Blocks[msg.dat[p]].texId,
                  1, 1, Blocks[msg.dat[p]].texId,
                  0, 1, Blocks[msg.dat[p]].texId,
                ]);
              }
          }
        }
      }
    }
  }

    self.postMessage({aTopic:'do_sendMainArrBuff', aBuf:aBuf}, [aBuf]);
}
