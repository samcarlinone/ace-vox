import {Shader} from './shader.js';

class ShaderCache {
  /**
   * load - Loads the text from glsl files with pattern (name)_vert.glsl and (name)_frag.glsl
   *
   * @param  {string[]} names    the list of names
   * @param  {function} callback the function that will be called when all files have been loaded, passed this object
   * @param  {function} err_callback the function that will be called if a loading error occurs
   * @return {ShaderCache} returns this
   */
  load(names, callback, err_callback) {
    this.vert = {};
    this.frag = {};
    this.shaders = {};

    this.names = names;

    var promises = [];

    for(var i=0; i<names.length*2; i++) {
      //GET Data
      promises.push(new Promise((resolve, reject) => {
        var client = new XMLHttpRequest();
        var name = names[Math.floor(i/2)];
        var type = (i%2==0)?'vert':'frag';
        client.open('GET', `/shaders/${name}_${type}.glsl`);
        client.onload = () => {
          if(client.status != 200)
            reject("Loading error");

          resolve([name, type, client.responseText]);
        }
        client.onerror = () => {
          reject("Loading error");
        }
        client.send();
      }));

      //When resolved place data appropriately
      promises[promises.length - 1].then((results) => {
        if(results[1] == 'vert')
          this.vert[results[0]] = results[2];
        else
          this.frag[results[0]] = results[2];
      });
    }

    //When loading is complete callback
    Promise.all(promises).then((results) => {
      for(var i=0; i<this.names.length; i++) {
        try {
          this.shaders[this.names[i]] = new Shader(this.vert[this.names[i]], this.frag[this.names[i]]);
        } catch(e) {
          console.error(e);
          err_callback("A shader compiling error has occured");
          return;
        }
      }

      callback(this);
    }, () => {
      err_callback("A shader loading error has occured");
    });

    return this;
  }
}

export default (new ShaderCache);
