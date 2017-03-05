var Blocks = [
  {
    name: 'DIRT',
    cube: true,
    texId: 0,
    transparent: false
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
//This is a singleton
export default Blocks;
