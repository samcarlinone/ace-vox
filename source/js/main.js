import {BasicModule} from './modules/game/basic_module.js';
import ShaderCache from './modules/graphics/shader_cache.js';
import TextureCache from './modules/graphics/texture_cache.js'
import AceVox from './modules/game/ace_vox.js';
import Blocks from './modules/blocks/blocks.js';
//import * as Victor from 'Victor';

/**
 * Constants / Flags
 */
const TIMESTEP = 1000/60;
const DEBUG = true;

/**
 * Variables
 */
//Main Loop Vars
var lastFrameTimeMs = 0,
    delta = 0;

//Game Vars
var currentModule;


/**
 * System Code
 */
window.onload = function() {
  init();

  if(DEBUG)
    window.AceVox = AceVox;
}

function init() {
  //Setup DOM
  AceVox.main = document.querySelector('.main-container');
  AceVox.can = document.querySelector('.main-view');
  AceVox.ui = document.querySelector('.main-ui');

  AceVox.game_size = [AceVox.main.clientWidth, AceVox.main.clientHeight];

  AceVox.can.width = AceVox.game_size[0];
  AceVox.can.height = AceVox.game_size[1];

  AceVox.ui.style.width = AceVox.game_size[0]+"px";
  AceVox.ui.style.height = AceVox.game_size[1]+"px";

  //Add event listeners
  AceVox.main.onclick = () => {
    AceVox.main.requestPointerLock();
  }

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement == AceVox.main) {
      document.addEventListener("mousemove", mouseMove, false);
    } else {
      document.removeEventListener("mousemove", mouseMove, false);
    }
  }, false);

  window.addEventListener('keydown', keyDown, false);
  window.addEventListener('keyup', keyUp, false);

  //Initialize WebGL2
  var gl = AceVox.can.getContext( 'webgl2', { antialias: false } );
  var isWebGL2 = !!gl;
  if(!isWebGL2) {
      AceVox.ui.innerHTML = `WebGL 2 is not available. <br>
      See <a href="https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">How to get a WebGL 2 implementation</a> <br>
      <u>(TL:DR install Google Chrome)</u>`;
      AceVox.ui.className += " webgl2-fail";
      return;
  }

  AceVox.gl = gl;

  //Configure webgl
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  //Load Resources
  AceVox.shader_cache = ShaderCache.load(['trs', 'chunk_basic'],
  () => {
    TextureCache.load([{name: "atlas", imgs:["dirtTop", "dirtSide"]}], loadingComplete);
  }
  ,
  (err) => {
    console.error(err);

    if(!DEBUG)
      alert("A loading error has occured, try reloading. If you see this message again check network or contact support.");
  });
}

function loadingComplete() {
  console.log("Loading complete");
  //Initialize game
  currentModule = new BasicModule();
  window.currentModule = currentModule;

  //Begin loop
  requestAnimationFrame(mainLoop);
}

function update(delta) {
  currentModule.update(delta);
}

function render() {
  currentModule.render();
}

function panic() {
    delta = 0;
}

function mainLoop(timestamp) {
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

    var numUpdateSteps = 0;
    while (delta >= TIMESTEP) {
        update(TIMESTEP);
        delta -= TIMESTEP;
        if (++numUpdateSteps >= 240) {
            panic();
            break;
        }
    }

    render();

    requestAnimationFrame(mainLoop);
}

function mouseMove(e) {
  if(currentModule.mouseMove)
    currentModule.mouseMove(e);
}

function keyDown(e) {
  if(currentModule.keyDown)
    currentModule.keyDown(e);
}

function keyUp(e) {
  if(currentModule.keyUp)
    currentModule.keyUp(e);
}
