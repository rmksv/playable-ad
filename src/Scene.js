import * as THREE from "three";
import App from "./App";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

export default class Scene extends THREE.Scene {
    constructor() {
        super();
        this.createChildren();
    }

    createChildren() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
        this.camera.position.set(0, 1, -1);

        this.controls = new OrbitControls(this.camera, App.renderer.domElement);

        let light = new THREE.DirectionalLight(0xffffff, 0.75);
        light.position.set(1, 1, 1);
        this.add(light);

        light = new THREE.DirectionalLight(0xffffff, 0.75);
        light.position.set(-1, -1, -1);
        this.add(light);

        light = new THREE.AmbientLight(0xffffff, 0.7);
        this.add(light);

        this.map = App.getModel("map");
        this.map.scale.setScalar(0.1);
        this.add(this.map);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    tick() {
        if (this.controls) {
            this.controls.update();
        }

        App.renderer.render(this, this.camera);
    }
}