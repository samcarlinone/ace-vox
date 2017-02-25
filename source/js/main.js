//import {ParticleManager} from './modules/particles.js';
//import * as Victor from 'Victor';

//Constants / Options
const TIMESTEP = 1000/60;

//Variables
var lastFrameTimeMs = 0,
    delta = 0;


//Code
window.onload = function() {
  init();
}

function init() {
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
