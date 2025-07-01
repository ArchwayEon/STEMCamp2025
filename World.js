import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class World{
   #engine
   #scene = new THREE.Scene();
   #camera
   #objectMap = new Map();
   #fov = 75;
   #aspect = 2;
   #zFar = 1000;
   #zNear = 0.1;
   #moveDirection = new THREE.Vector3(0, 0, 1);
   #distanceMoved = 0;
   #soldier = null;
   #mixer;
   #animations;

   constructor(engine){
      this.#engine = engine;
   }

   initialize(){
      this.#engine.initialize();
      this.#createPerspectiveCamera();
      this.#setUpScene();
      document.addEventListener("keydown", (event) => this.#keyDown(event));
   }

   // See: https://en.wikipedia.org/wiki/X11_color_names
   #setUpScene(){
      this.#addDirectionalLight('white', 0.6, 10, 10, -4);

      const softWhite = 0x404040;
      this.#addAmbientLight(softWhite);

      this.#camera.position.set(2, 2, 5); 
      this.#camera.lookAt(0, 0, 0);
      this.#camera.updateProjectionMatrix();

      this.#addAxesHelper(3);
      
      this.#addFloor('lightslategray', 10, 10);

      this.#addBox('Box1', 'forestgreen', 0.5, 1, 0.5, 0, 0.5, 0);

      this.#addSphere('Sphere1', 'darkviolet', 0.25, -1, 0.5, 0);

      this.#loadSoldier();
   }

   update(elapsedMS){
      const elapsedSeconds = elapsedMS / 1000;
      this.#engine.update(elapsedMS);

      this.#rotateObjectAroundY('Box1', 180, elapsedSeconds);

      this.#moveObjectBackAndForth('Sphere1', elapsedSeconds, 3);

      if(this.#mixer) this.#mixer.update(elapsedSeconds);
   }

   #rotateObjectAroundY(name, speed, elapsedSeconds){
      const object = this.#objectMap.get(name);
      const deltaRadians = THREE.MathUtils.degToRad(speed * elapsedSeconds);
      object.rotateY(deltaRadians);
   }

   #moveObjectBackAndForth(name, elapsedSeconds, distanceToMove = 2){
      const object = this.#objectMap.get(name);
      const deltaMove = new THREE.Vector3();
      deltaMove.addScaledVector(this.#moveDirection, elapsedSeconds);
      this.#distanceMoved += deltaMove.length();
      if(this.#distanceMoved >= distanceToMove){
         this.#moveDirection.negate();
         this.#distanceMoved = 0;
      }
      object.position.add(deltaMove);
   }

   preRender(){
   }

   render(){
      this.#engine.render(this.#scene, this.#camera);
   }

   #addAxesHelper(size = 1){
      const axesHelper = new THREE.AxesHelper(size);
      this.#scene.add( axesHelper );
   }

   #addDirectionalLight(color, intensity, x, y, z){
      const lightColor = new THREE.Color(color);
      const light = new THREE.DirectionalLight(lightColor, intensity);
      light.castShadow = true;
      light.position.set(x, y, z);
      this.#scene.add(light);
   }

   #addAmbientLight(color){
      const theColor = new THREE.Color(color);
      const ambientLight = new THREE.AmbientLight(theColor); 
      this.#scene.add(ambientLight);
   }

   #addFloor(color, width, depth){
      let floorColor = new THREE.Color(color);
      let geometry = new THREE.PlaneGeometry(width, depth);
      let material = new THREE.MeshPhongMaterial({color: floorColor, side: THREE.DoubleSide});
      const floor = new THREE.Mesh(geometry, material);
      floor.rotateX(THREE.MathUtils.degToRad(90));
      floor.receiveShadow = true;
      this.#scene.add(floor);
   }

   #addBox(name, color, width, height, depth, x, y, z){
      let boxColor = new THREE.Color(color);
      let geometry = new THREE.BoxGeometry(width, height, depth);
      let material = new THREE.MeshPhongMaterial({color: boxColor});
      const box = new THREE.Mesh(geometry, material);
      box.position.set(x, y, z);
      box.castShadow = true;
      box.receiveShadow = true;
      this.#scene.add(box);
      this.#objectMap.set(name, box);
   }

   #addSphere(name, color, radius, x, y, z){
      let sphereColor = new THREE.Color(color);
      let geometry = new THREE.SphereGeometry(radius);
      let material = new THREE.MeshPhongMaterial({color: sphereColor});
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      this.#scene.add(sphere);
      this.#objectMap.set(name, sphere);
   }

   #createPerspectiveCamera(){
      this.#camera = new THREE.PerspectiveCamera(
         this.#fov, this.#aspect, this.#zNear, this.#zFar);
      this.#camera.lookAt(0, 0, 0);
      this.#camera.position.set(0, 1, 5); 
      this.#camera.updateProjectionMatrix();
   }

   #loadSoldier(){
      // See https://threejs.org/examples/#webgl_animation_skinning_blending
      const loader = new GLTFLoader();
      loader.load('Soldier.glb', (gltf) => {
         this.#soldier = gltf.scene;
         this.#scene.add(this.#soldier);
         this.#soldier.traverse(function(object) {
            if (object.isMesh) object.castShadow = true;
         });
         this.#soldier.position.set(2, 0, 0);
         this.#soldier.rotateY(THREE.MathUtils.degToRad(180));
         this.#mixer = new THREE.AnimationMixer(this.#soldier);
         this.#animations = gltf.animations;
         console.log(this.#animations);
         this.#activateActionByName("Idle"); // Idle, Run, TPose, Walk
      });
   }

   #activateActionByName(name){
      for(let i = 0; i < this.#animations.length; i++){
         this.#mixer.clipAction(this.#animations[i]).stop();
      }
      
      const clip = THREE.AnimationClip.findByName(this.#animations, name);
      const action = this.#mixer.clipAction(clip);
      action.play();
   }

   #keyDown(event){
      const keyName = event.key;
      console.log(keyName);
      switch(keyName){
         case "i":
         case "I":
            this.#activateActionByName("Idle");
            break;
         case "r":
         case "R":
            this.#activateActionByName("Run");
            break;
         case "t":
         case "T":
            this.#activateActionByName("TPose");
            break;
         case "w":
         case "W":
            this.#activateActionByName("Walk");
            break;
         case "1":
            this.#camera.position.set(0, 2, 5);
            this.#camera.lookAt(0, 0, 0);
            this.#camera.updateProjectionMatrix();
            break;
         case "2":
            this.#camera.position.set(5, 2, 0);
            this.#camera.lookAt(0, 0, 0);
            this.#camera.updateProjectionMatrix();
            break  
         case "3":
            this.#camera.position.set(0, 2, -5);
            this.#camera.lookAt(0, 0, 0);
            this.#camera.updateProjectionMatrix();
            break;
         case "4":
            this.#camera.position.set(-5, 2, 0);
            this.#camera.lookAt(0, 0, 0);
            this.#camera.updateProjectionMatrix();
            break;
         case "5":
            this.#camera.position.set(2, 2, 5);
            this.#camera.lookAt(0, 0, 0);
            this.#camera.updateProjectionMatrix();
            break; 
      }
   }



}