//=====================================[Copied from blocks.js
var Blocks = [
  {
    name: 'AIR',
    cube: false,
    texId: -1,
    transparent: true
  },
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
const TRANSPARENT = 0b10000000000000000000000000000000;
const SUN         = 0b11000000000000000000000000000000;
const LIGHT_R     = 0b00111110000000000000000000000000;
const LIGHT_G     = 0b00000001111100000000000000000000;
const LIGHT_B     = 0b00000000000011111000000000000000;
const BLOCK_MASK  = 0b00000000000000000000111111111111;
const ROT_MASK    = 0b00000000000000000111000000000000;

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
  var data = new Uint32Array(msg.data.dat);
  var bData = new Uint32Array(msg.data.bDat);

  var pos = [];
  var norm = [];
  var tex = [];
  var light = [];

  for(var x=0; x<SIZE_1; x++) {
    for(var y=0; y<SIZE_1; y++) {
      for(var z=0; z<SIZE_1; z++) {
        var p = x + z*SIZE_1 + y*SIZE_2;
        //Check if not air
        if((data[p] & BLOCK_MASK) > 0) {
          var val = data[p] & BLOCK_MASK;
          //Check if cube with face unneeded or custom mesh
          if(Blocks[val].cube) {
            //Check all faces

            //=================[Top
            var next = 0;
            if(y == 63)
              next = bData[x + z*SIZE_1 + (SIZE_2*4)];
            else
              next = data[p + SIZE_2];

            if((next & TRANSPARENT) !== 0) {
              pos.push(
                  x, y+1,   z,
                x+1, y+1, z+1,
                x+1, y+1,   z,

                  x, y+1, z+1,
                x+1, y+1, z+1,
                  x, y+1,   z
              );

              norm.push(
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,

                0, 1, 0,
                0, 1, 0,
                0, 1, 0
              );

              var sideTex = 0;
              switch((data[p] & ROT_MASK) >>> 12) {
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
                case 4:
                  sideTex = Blocks[val].texId[0];
                  break;
                //D
                case 5:
                  sideTex = Blocks[val].texId[3];
                  break;
              }

              tex.push(
                0, 0, sideTex,
                1, 1, sideTex,
                1, 0, sideTex,

                0, 1, sideTex,
                1, 1, sideTex,
                0, 0, sideTex
              );

              if((next & SUN) !== 0) {
                light.push(
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,

                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000
                );
              } else {
                var lr = (next & LIGHT_R) >>> 25;
                var lg = (next & LIGHT_G) >>> 20;
                var lb = (next & LIGHT_B) >>> 15;

                light.push(
                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb,

                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb
                );
              }
            }
            //=================[End Top

            //=================[Bottom
            if(y == 0)
              next = bData[x + z*SIZE_1 + (SIZE_2*5)];
            else
              next = data[p - SIZE_2];

            if((next & TRANSPARENT) !== 0) {
              pos.push(
                  x,   y,   z,
                x+1,   y,   z,
                x+1,   y, z+1,

                  x,   y,   z,
                x+1,   y, z+1,
                  x,   y, z+1
              );

              norm.push(
                0,-1, 0,
                0,-1, 0,
                0,-1, 0,

                0,-1, 0,
                0,-1, 0,
                0,-1, 0
              );

              var sideTex = 0;

              switch((data[p] & ROT_MASK) >>> 12) {
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
                case 4:
                  sideTex = Blocks[val].texId[3];
                  break;
                //D
                case 5:
                  sideTex = Blocks[val].texId[0];
                  break;
              }

              tex.push(
                0, 0, sideTex,
                1, 0, sideTex,
                1, 1, sideTex,

                0, 0, sideTex,
                1, 1, sideTex,
                0, 1, sideTex
              );

              if((next & SUN) !== 0) {
                light.push(
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,

                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000
                );
              } else {
                var lr = (next & LIGHT_R) >>> 25;
                var lg = (next & LIGHT_G) >>> 20;
                var lb = (next & LIGHT_B) >>> 15;

                light.push(
                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb,

                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb
                );
              }
            }
            //=================[End Bottom

            //=================[North
            if(z == 0)
              next = bData[x + y*SIZE_1];
            else
              next = data[p - SIZE_1];

            if((next & TRANSPARENT) !== 0) {
              pos.push(
                x+1,   y,   z,
                  x,   y,   z,
                x+1, y+1,   z,

                  x, y+1,   z,
                x+1, y+1,   z,
                  x,   y,   z
              );

              norm.push(
                0, 0,-1,
                0, 0,-1,
                0, 0,-1,

                0, 0,-1,
                0, 0,-1,
                0, 0,-1
              );

              var sideTex = 0;

              switch((data[p] & ROT_MASK) >>> 12) {
                //N
                case 0:
                  sideTex = Blocks[val].texId[0];
                  break;
                //S
                case 1:
                  sideTex = Blocks[val].texId[3];
                  break;
                //E
                case 2:
                  sideTex = Blocks[val].texId[2];
                  break;
                //W
                case 3:
                  sideTex = Blocks[val].texId[2];
                  break;
                //U
                case 4:
                  sideTex = Blocks[val].texId[1];
                  break;
                //D
                case 5:
                  sideTex = Blocks[val].texId[1];
                  break;
              }

              tex.push(
                0, 1, sideTex,
                1, 1, sideTex,
                0, 0, sideTex,

                1, 0, sideTex,
                0, 0, sideTex,
                1, 1, sideTex
              );

              if((next & SUN) !== 0) {
                light.push(
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,

                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000
                );
              } else {
                var lr = (next & LIGHT_R) >>> 25;
                var lg = (next & LIGHT_G) >>> 20;
                var lb = (next & LIGHT_B) >>> 15;

                light.push(
                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb,

                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb
                );
              }
            }
            //=================[End North

            //=================[South
            if(z == 63)
              next = bData[x + y*SIZE_1 + (SIZE_2)];
            else
              next = data[p + SIZE_1];

            if((next & TRANSPARENT) !== 0) {
              pos.push(
                  x,   y, z+1,
                x+1,   y, z+1,
                x+1, y+1, z+1,

                  x,   y, z+1,
                x+1, y+1, z+1,
                  x, y+1, z+1
              );

              norm.push(
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,

                0, 0, 1,
                0, 0, 1,
                0, 0, 1
              );

              var sideTex = 0;

              switch((data[p] & ROT_MASK) >>> 12) {
                //N
                case 0:
                  sideTex = Blocks[val].texId[3];
                  break;
                //S
                case 1:
                  sideTex = Blocks[val].texId[0];
                  break;
                //E
                case 2:
                  sideTex = Blocks[val].texId[2];
                  break;
                //W
                case 3:
                  sideTex = Blocks[val].texId[2];
                  break;
                //U
                case 4:
                  sideTex = Blocks[val].texId[1];
                  break;
                //D
                case 5:
                  sideTex = Blocks[val].texId[1];
                  break;
              }

              tex.push(
                1, 1, sideTex,
                0, 1, sideTex,
                0, 0, sideTex,

                1, 1, sideTex,
                0, 0, sideTex,
                1, 0, sideTex
              );

              if((next & SUN) !== 0) {
                light.push(
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,

                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000
                );
              } else {
                var lr = (next & LIGHT_R) >>> 25;
                var lg = (next & LIGHT_G) >>> 20;
                var lb = (next & LIGHT_B) >>> 15;

                light.push(
                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb,

                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb
                );
              }
            }
            //=================[End South

            //=================[West
            if(x == 0)
              next = bData[y + z*SIZE_1 + (SIZE_2*3)];
            else
              next = data[p - 1];

            if((next & TRANSPARENT) !== 0) {
              pos.push(
                  x, y+1,   z,
                  x,   y,   z,
                  x, y+1, z+1,

                  x,   y, z+1,
                  x, y+1, z+1,
                  x,   y,   z
              );

              norm.push(
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,

                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0
              );

              var sideTex = 0;

              switch((data[p] & ROT_MASK) >>> 12) {
                //N
                case 0:
                  sideTex = Blocks[val].texId[2];
                  break;
                //S
                case 1:
                  sideTex = Blocks[val].texId[2];
                  break;
                //E
                case 2:
                  sideTex = Blocks[val].texId[3];
                  break;
                //W
                case 3:
                  sideTex = Blocks[val].texId[0];
                  break;
                //U
                case 4:
                  sideTex = Blocks[val].texId[1];
                  break;
                //D
                case 5:
                  sideTex = Blocks[val].texId[1];
                  break;
              }

              tex.push(
                1, 0, sideTex,
                1, 1, sideTex,
                0, 0, sideTex,

                0, 1, sideTex,
                0, 0, sideTex,
                1, 1, sideTex
              );

              if((next & SUN) !== 0) {
                light.push(
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,

                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000
                );
              } else {
                var lr = (next & LIGHT_R) >>> 25;
                var lg = (next & LIGHT_G) >>> 20;
                var lb = (next & LIGHT_B) >>> 15;

                light.push(
                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb,

                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb
                );
              }
            }
            //=================[End West

            //=================[East
            if(x == 63)
              next = bData[y + z*SIZE_1 + (SIZE_2*2)];
            else
              next = data[p + 1];

            if((next & TRANSPARENT) !== 0) {
              pos.push(
                x+1,   y,   z,
                x+1, y+1,   z,
                x+1, y+1, z+1,

                x+1,   y,   z,
                x+1, y+1, z+1,
                x+1,   y, z+1
              );

              norm.push(
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,

                1, 0, 0,
                1, 0, 0,
                1, 0, 0
              );

              var sideTex = 0;

              switch((data[p] & ROT_MASK) >>> 12) {
                //N
                case 0:
                  sideTex = Blocks[val].texId[2];
                  break;
                //S
                case 1:
                  sideTex = Blocks[val].texId[2];
                  break;
                //E
                case 2:
                  sideTex = Blocks[val].texId[0];
                  break;
                //W
                case 3:
                  sideTex = Blocks[val].texId[3];
                  break;
                //U
                case 4:
                  sideTex = Blocks[val].texId[1];
                  break;
                //D
                case 5:
                  sideTex = Blocks[val].texId[1];
                  break;
              }

              tex.push(
                1, 1, sideTex,
                1, 0, sideTex,
                0, 0, sideTex,

                1, 1, sideTex,
                0, 0, sideTex,
                0, 1, sideTex
              );

              if((next & SUN) !== 0) {
                light.push(
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,

                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000,
                  0b100000, 0b100000, 0b100000
                );
              } else {
                var lr = (next & LIGHT_R) >>> 25;
                var lg = (next & LIGHT_G) >>> 20;
                var lb = (next & LIGHT_B) >>> 15;

                light.push(
                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb,

                  lr, lg, lb,
                  lr, lg, lb,
                  lr, lg, lb
                );
              }
            }
            //=================[End East
          }
        }
      }
    }
  }

  if(pos.length == 0) {
    pos.push(0, 0, 0);
    norm.push(0, 0, 0);
    tex.push(0, 0, 0);
    light.push(0, 0, 0);
  }

  pos = new Float32Array(pos);
  norm = new Float32Array(norm);
  tex = new Float32Array(tex);
  light = new Uint8Array(light);

  self.postMessage({
    id: msg.data.id,
    dat: data,
    bDat: bData,
    pos: pos,
    norm: norm,
    tex: tex,
    light: light
  }, [
    data.buffer,
    bData.buffer,
    pos.buffer,
    norm.buffer,
    tex.buffer,
    light.buffer
  ]);
}
