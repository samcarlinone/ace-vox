import ChunkBuilder from './chunk_builder.js';
import {Chunk} from './chunk.js';

function operate(op_code, chunk) {
  switch (op_code) {
    case ChunkBuilder.UPDATE_N:
      var other_chunk = chunk.world.chunkStore.getObj([chunk.position[0], chunk.position[1], chunk.position[2]+64]);

      if(other_chunk == -1)
        return true;

      if(other_chunk.locked)
        return false;

      for(var x=0; x<64; x++) {
        for(var y=0; y<64; y++) {
          other_chunk.bData[x+y*Chunk.SIZE_1] = chunk.data[x + 63*Chunk.SIZE_1 + y*Chunk.SIZE_2];
        }
      }

      other_chunk.dirty = true;

      return true;

    case ChunkBuilder.UPDATE_S:
      var other_chunk = chunk.world.chunkStore.getObj([chunk.position[0], chunk.position[1], chunk.position[2]-64]);

      if(other_chunk == -1)
        return true;

      if(other_chunk.locked)
        return false;

      for(var x=0; x<64; x++) {
        for(var y=0; y<64; y++) {
          other_chunk.bData[x+y*Chunk.SIZE_1 + Chunk.SIZE_2] = chunk.data[x + y*Chunk.SIZE_2];
        }
      }

      other_chunk.dirty = true;

      return true;

    case ChunkBuilder.UPDATE_W:
      var other_chunk = chunk.world.chunkStore.getObj([chunk.position[0]+64, chunk.position[1], chunk.position[2]]);

      if(other_chunk == -1)
        return true;

      if(other_chunk.locked)
        return false;

      for(var z=0; z<64; z++) {
        for(var y=0; y<64; y++) {
          other_chunk.bData[y+z*Chunk.SIZE_1 + Chunk.SIZE_2*3] = chunk.data[63 + z*Chunk.SIZE_1 + y*Chunk.SIZE_2];
        }
      }

      other_chunk.dirty = true;

      return true;

    case ChunkBuilder.UPDATE_E:
      var other_chunk = chunk.world.chunkStore.getObj([chunk.position[0]-64, chunk.position[1], chunk.position[2]]);

      if(other_chunk == -1)
        return true;

      if(other_chunk.locked)
        return false;

      for(var z=0; z<64; z++) {
        for(var y=0; y<64; y++) {
          other_chunk.bData[y+z*Chunk.SIZE_1 + Chunk.SIZE_2*2] = chunk.data[z*Chunk.SIZE_1 + y*Chunk.SIZE_2];
        }
      }

      other_chunk.dirty = true;

      return true;
  }

  return true;
}

export default operate;
