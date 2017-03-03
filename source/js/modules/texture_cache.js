import {ArrayTexture} from './array_texture.js';

class TextureCache {
  /**
   * load - Loads the images and creates textures
   *
   * @param  {Object} images {img3d: [{name, imgs:[names, ...]}}
   * @param  {function} callback the function that will be called when all files have been loaded, passed this object
   * @return {ShaderCache} returns this
   */
  load(img3d, callback) {
    this.cache3d = {};

    for(var i=0; i<img3d.length; i++) {
      this.cache3d[img3d[i].name] = img3d[i];
    }

    var promises = [];

    for(var name in this.cache3d) {
      for(var i=0; i<this.cache3d[name].imgs.length; i++) {
        //GET Data
        promises.push(new Promise((resolve, reject) => {
          var img = new Image();
          img.onload = () => { resolve(img); };
          img.src = `img\\${this.cache3d[name].imgs[i]}.png`;
          img.name = name;
          img.id = i;
        }));

        //When resolved place data appropriately
        promises[promises.length - 1].then((result) => {
          this.cache3d[result.name].imgs[result.id] = result;
        });
      }
    }

    //When loading is complete callback
    Promise.all(promises).then((results) => {
      var temp = {};

      for(var name in this.cache3d) {
        temp[name] = new ArrayTexture(this.cache3d[name]);
      }

      this.cache3d = temp;

      callback(this);
    });

    return this;
  }
}

export default (new TextureCache);
