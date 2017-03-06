import TerrainGen from './terrain_gen.js';
import AceVox from '../game/ace_vox.js';

class Operator {
  execute(op) {
    switch(op.type) {
      case 0:
        TerrainGen.generate(op.target, op.args);
        return true;
    }
  }
}

export default (new Operator);
