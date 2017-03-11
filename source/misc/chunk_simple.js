//=====================================[Copied from blocks.js
var Blocks = [
  {
    name: 'DIRT',
    cube: true,
    texId: 0,
    transparent: false
  },
  {
    name: 'DIRT-TOP',
    cube: true,
    texId: [1, 0, 2],
    transparent: false
  },
  {
    name: 'LEAVES',
    cube: true,
    texId: 3,
    transparent: true
  }
];

//Adjust texture id to conform
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
//=====================================[End Copy Pasta

//Masks
const AIR         = 0b1000000000000000;
const LIGHT_R     = 0b0111110000000000;
const LIGHT_G     = 0b0000001111100000;
const LIGHT_B     = 0b0000000000011111;
const BLOCK_MASK  = 0b0000111111111111;
const ROT_MASK    = 0b0111000000000000;

//Size Constants
const SIZE_1 = 64;
const SIZE_2 = SIZE_1 * SIZE_1;
const SIZE_3 = SIZE_1 * SIZE_1 * SIZE_1;

/**
 * Passed in chunk data to convert to meshes
 *
 * @param  {Object} msg id, and dat {Buffer} members
 * @return {Object}     contains id, as well as pos, tex, light {Buffer} members and dat {Buffer}
 */
self.onmessage = function(msg) {
  var data = new Uint16Array(msg.data.dat);
  var bData = new Uint16Array(msg.data.bDat);
  var op = msg.data.op;

  switch(msg.data.op) {
    case 0:
      generate(data, msg.data.realm, msg.data.pos);
      break;
  }

  self.postMessage({
    id: msg.data.id,
    dat: data,
    bDat: bData
  }, [
    data.buffer,
    bData.buffer
  ]);
}

function generate(data, realm, position) {
  switch(realm) {
    case 'overworld-0.0.1':
      for(var x=0; x<64; x++) {
        for(var z=0; z<64; z++) {
          var height = (Math.sin((x + z) / 48)+1)*32;//(this.noise.perlin2(chunk.position[0]/64 + x/64, chunk.position[2]/64 + z/64)+1)*32;

          for(var y=0; y<64; y++) {
            var p = x + z*64 + y*4096;

            if(height < y + position[1]) {
              if(Math.random() > 0.999) {
                data[p] = 2;
              } else {
                data[p] = 0b1111111111111111;//Chunk.SUN_AIR;
              }
            } else {
              if(height == y + position[1]) {
                data[p] = 0b0100000000000001;
              } else {
                data[p] = 0b0100000000000001;
                //chunk.data[p] = 0;
              }
            }
          }
        }
      }

      break;
  }
}
