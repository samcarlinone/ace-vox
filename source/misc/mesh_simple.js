//=====================================[Copied from blocks.js
var Blocks = [
  {
    name: 'DIRT',
    cube: true,
    texId: 0
  }
];

for(var i=0,len=Blocks.length; i<len; i++) {
  if(!Blocks[i].texId.length) {
    Blocks[i].texId = [Blocks[i].texId, Blocks[i].texId, Blocks[i].texId, Blocks[i].texId];
  } else {
    switch(Blocks[i].texId.length) {
      case 2:
        Blocks[i].texId = [Blocks[i].texId[0], Blocks[i].texId[1], Blocks[i].texId[1], Blocks[i].texId[1]];
        break;
      case 3:
        Blocks[i].texId = [Blocks[i].texId[0], Blocks[i].texId[2], Blocks[i].texId[2], Blocks[i].texId[1]];
        break;
    }
  }
}
//=====================================[End Copy Pasts

//Masks
const AIR         = 0b1000000000000000;
const BLOCK_MASK  = 0b0000111111111111;
const ROT_MASK    = 0b0111000000000000;

/**
 * Passed in chunk data to convert to meshes
 *
 * @param  {Object} msg id, and dat {Uint16Array} members
 * @return {Object}     contains id, as well as pos, tex, light {Float32Array} members
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
          var val = msg.dat[p] & BLOCK_MASK;
          //Check if cube with face unneeded or custom mesh
          if(Blocks[val].cube) {
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

              var sideTex = 0;

              switch(msg.dat[p] & ROT_MASK) {
                //N
                case 0:
                  sideTex = Blocks[val].texId[1];
                  break;
                //S
                case 1:
                  sideTex = Blocks[val].texId[1];
                  break;
                //E
                case 2:
                  sideTex = Blocks[val].texId[1];
                  break;
                //W
                case 3:
                  sideTex = Blocks[val].texId[1];
                  break;
                //U
                case 0:
                  sideTex = Blocks[val].texId[0];
                  break;
                //D
                case 0:
                  sideTex = Blocks[val].texId[3];
                  break;
              }

              tex = tex.concat([
                0, 0, sideTex,
                1, 0, sideTex,
                1, 1, sideTex,

                0, 0, sideTex,
                1, 1, sideTex,
                0, 1, sideTex,
              ]);
            }
          }
        }
      }
    }
  }

    self.postMessage({aTopic:'do_sendMainArrBuff', aBuf:aBuf}, [aBuf]);
}
