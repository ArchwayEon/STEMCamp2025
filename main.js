"use strict";

  // {
  //  "imports": {
  //    "three": "https://unpkg.com/three@0.154.0/build/three.module.js",
  //    "three/addons/": "https://unpkg.com/three@0.154.0/examples/jsm/"
  //  }
  //} 

import { EngineLoop } from './EngineLoop.js';
import { World } from './World.js';
import { ThreeJSEngine } from './ThreeJSEngine.js';

const canvas = document.querySelector('#drawingArea');

let engineLoop = new EngineLoop(new World(new ThreeJSEngine(canvas)));
engineLoop.initialize();
engineLoop.run();