import * as THREE from "three";
import Scene from "./src/Scene";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

class App {

    static renderer = null;
    static scene = null;
    static time = 0;
    static clock = new THREE.Clock();
    static models = {};

    static async init() {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        App.renderer = renderer;

        await App.loadAssets();

        App.scene = new Scene;

        renderer.setAnimationLoop(App.tick);

        window.addEventListener("resize", App.onResize);
    }

    static loadAssets() {
        return new Promise((resolve) => {
            const loader = new GLTFLoader();
            loader.load("public/map.glb", (model) => {
                App.models.map = model.scene;
                resolve();
            });
        });
    }

    static getModel(name) {
        return App.models[name].clone();
    }

    static tick(time) {
        const delta = App.time === 0 ? 0 : time - App.time;

        App.scene.tick(delta);

        App.time = time;
    }

    static onResize() {
        App.scene.onResize();
        App.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export default App;