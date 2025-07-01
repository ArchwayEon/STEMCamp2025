import * as THREE from 'three';

export class ThreeJSEngine{
   #canvas;
   #renderer;
   #clearColor = 0x000;
   #cameraAspect = 2;

   constructor(canvas){
      this.#canvas = canvas;
   }

   get cameraAspect() {
      return this.#cameraAspect;
   }

   initialize(){
      this.#renderer = new THREE.WebGLRenderer({
         antialias: true, canvas: this.#canvas
      });
      this.#renderer.shadowMap.enabled = true;
      this.#renderer.setClearColor(this.#clearColor);
   }

   update(elapsedMS){
   }

   render(scene, camera){
      if(this.#resizeRendererToDisplaySize()){
         const canvas = this.#renderer.domElement;
         camera.aspect = canvas.clientWidth / canvas.clientHeight;
         camera.updateProjectionMatrix();
      }
      this.#renderer.render(scene, camera);
   }

   #resizeRendererToDisplaySize(){
      const canvas = this.#renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
         this.#renderer.setSize(width, height, false);
      }
      this.#cameraAspect = width / height;
      return needResize;
   }

}