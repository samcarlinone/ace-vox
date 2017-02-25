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

//DOM Vars
var main, can, ctx, ui;

//Game Vars
var currentModule, game_size;


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
