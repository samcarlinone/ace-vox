import ChunkBuilder from './chunk_builder.js';
import {Chunk} from './chunk.js';

function operate(op_code, op_data, chunk) {
  switch (op_code) {
    case ChunkBuilder.UPDATE_B:
      var other_chunk = chunk.world.chunkStore.getObj([chunk.position[0]+op_data[0]*64, chunk.position[1]+op_data[1]*64, chunk.position[2]+op_data[2]*64]);

      if(other_chunk == -1)
        return true;

      if(other_chunk.locked)
        return false;

      if(op_data[0] !== 0) {
        var dir_index = getDirectionIndex(op_data[0], op_data[1], op_data[2]);
        var offset = (op_data[0] > 0) ? 63 : 0;
        for(var y=0; y<64; y++) {
          for(var z=0; z<64; z++) {
            other_chunk.bData[y+z*Chunk.SIZE_1 + Chunk.SIZE_2*dir_index] = chunk.data[offset + z*Chunk.SIZE_1 + y*Chunk.SIZE_2];
          }
        }
      }
      if(op_data[1] !== 0) {
        var dir_index = getDirectionIndex(op_data[0], op_data[1], op_data[2]);
        var offset = (op_data[1] > 0) ? 63*Chunk.SIZE_2 : 0;
        for(var x=0; x<64; x++) {
          for(var z=0; z<64; z++) {
            other_chunk.bData[x+z*Chunk.SIZE_1 + Chunk.SIZE_2*dir_index] = chunk.data[x + z*Chunk.SIZE_1 + offset];
          }
        }
      }
      if(op_data[2] !== 0) {
        var dir_index = getDirectionIndex(op_data[0], op_data[1], op_data[2]);
        var offset = (op_data[2] > 0) ? 63*Chunk.SIZE_1 : 0;
        for(var x=0; x<64; x++) {
          for(var y=0; y<64; z++) {
            other_chunk.bData[x+y*Chunk.SIZE_1 + Chunk.SIZE_2*dir_index] = chunk.data[x + offset + y*Chunk.SIZE_2];
          }
        }
      }

      other_chunk.dirty = true;

      return true;

    case ChunkBuilder.UPDATE_1B:

      var other_chunk = chunk.world.chunkStore.getObj([chunk.position[0], chunk.position[1]-64, chunk.position[2]]);

      if(other_chunk == -1)
        return true;

      if(other_chunk.locked)
        return false;

      for(var x=0; x<64; x++) {
        for(var z=0; z<64; z++) {
          other_chunk.bData[x+z*Chunk.SIZE_1 + Chunk.SIZE_2*4] = chunk.data[x + z*Chunk.SIZE_1];
        }
      }

      other_chunk.dirty = true;

      return true;
  }

  return true;
}

function getDirectionIndex(x, y, z) {
  if(z === -1)
    return 0;

  if(z === 1)
    return 1;

  if(x === 1)
    return 2;

  if(x === -1)
    return 3;

  if(y === 1)
    return 4;

  if(y === -1)
    return 5;

  throw "Invalid Direction Position";
}

export default operate;
