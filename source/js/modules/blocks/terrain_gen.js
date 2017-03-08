import NoiseJS from 'noisejs';
import {Chunk} from './chunk.js';

class TerrainGen {
  constructor () {
    this.noise = new NoiseJS.Noise(Math.random());
  }

  generate(chunk, type) {
    switch(type) {
      case 'overworld-0.0.1':
        for(var x=0; x<64; x++) {
          for(var z=0; z<64; z++) {
            var height = (this.noise.perlin2(chunk.position[0]/64 + x/64, chunk.position[2]/64 + z/64)+1)*32;

            for(var y=0; y<64; y++) {
              var p = x + z*64 + y*4096;

              if(height < y + chunk.position[1]) {
                if(Math.random() > 0.999) {
                  chunk.data[p] = 2;
                } else {
                  chunk.data[p] = Chunk.SUN_AIR;
                }
              } else {
                if(height == y + chunk.position[1]) {
                  chunk.data[p] = 0b0100000000000001;
                } else {
                  chunk.data[p] = 0b0100000000000001;
                  //chunk.data[p] = 0;
                }
              }
            }
          }
        }

        chunk.dirty = true;

        break;

      case 'testing':
          for(var x=0; x<64; x++) {
            for(var z=0; z<64; z++) {
              var height = ((chunk.position[0] + x)/16)+32;

              for(var y=0; y<64; y++) {
                var p = x + z*64 + y*4096;

                if(height < y + chunk.position[1])
                  chunk.data[p] = Chunk.SUN_AIR;
                else
                  chunk.data[p] = 0;
              }
            }
          }

          chunk.dirty = true;

          break;
    }
  }
}

//This is a singleton
export default (new TerrainGen);
