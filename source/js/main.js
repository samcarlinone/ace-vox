import {BasicModule} from './modules/basic_module.js';
import AceVox from './modules/ace_vox.js';
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

  //Initialize game
  currentModule = new BasicModule();

  //Begin loop
  requestAnimationFrame(mainLoop);
}

function update(delta) {
    //Update
}

function render() {

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

    if(numUpdateSteps > 0)
      render();

    requestAnimationFrame(mainLoop);
}
