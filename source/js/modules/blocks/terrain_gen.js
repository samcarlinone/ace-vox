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
          for(var y=0; y<64; y++) {
            for(var z=0; z<64; z++) {
              var p = x + z*64 + y*4096;

              if((this.noise.perlin2(chunk.position[0]/64 + x/64, chunk.position[2]/64 + z/64)+1)*32 < y)
                chunk.data[p] = Chunk.SUN_AIR;

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
