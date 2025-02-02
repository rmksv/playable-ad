import * as THREE from "three";
import App from "../App";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import Ship from "./Ship";
import Player from "./Player";
import CannonDebugRenderer from "./cannonDebugRenderer";
import PhysWorld from "./PhysWorld";
import Ball from "./Ball";

export default class Scene extends THREE.Scene {
    constructor() {
        super();
        this.isDown = "none";
        this.time = 0;
        this.balls = [];

        this.createChildren();
        this.initPhysics();
        this.handleEvents();
    }

    createChildren() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
        this.camera.position.set(0, 10, -10);
        this.camera.lookAt(0, 0, 0);

        this.controls = new OrbitControls(this.camera, App.renderer.domElement);

        let light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 10, -10);
        this.add(light);

        light = new THREE.AmbientLight(0xffffff, 0.5);
        this.add(light);

        this.map = App.getModel("map");
        this.add(this.map);

        this.map.getObjectByName("BallSpawner").visible = false;
        this.map.getObjectByName("ShipSpawners").visible = false;

        light = this.map.getObjectByName("Sun");
        light.intensity = 7000;
        light.distance = 1000;
        this.add(light);

        this.water = this.map.getObjectByName("Water");
        this.ship = new Ship(this.map.getObjectByName("Ship"));
        this.player = new Player(this.map.getObjectByName("player_1_baseball_Clone_"));
    }

    initPhysics() {
        this.physWorld = new PhysWorld();

        this.physWorld.addGround(this.water);
        this.physWorld.addLandZone(this.map.getObjectByName("Zones"));
        this.player.initPhysics(this.physWorld);
        this.ship.initPhysics(this.physWorld);

        this.cannonDebugRenderer = new CannonDebugRenderer(this, this.physWorld);
    }

    handleEvents() {
        document.addEventListener("keydown", (e) => {
            if (e.code === "KeyA") {
                this.player.setDirection({x: 1, y: 0});
            }
            if (e.code === "KeyD") {
                this.player.setDirection({x: -1, y: 0});
            }
        });

        if (this.controls) {
            return;
        }
        document.addEventListener("pointerdown", this.onMouseDown.bind(this));
        document.addEventListener("pointermove", this.onMouseMove.bind(this));
        document.addEventListener("pointerup", this.onMouseUp.bind(this));
    }

    onMouseDown(e) {
        if (this.isDown !== "none") {
            return;
        }

        this.isDown = e.pointerId;

        this.startX = e.clientX;
    }

    onMouseMove(e) {
        if (this.isDown !== e.pointerId) {
            return;
        }

        let x = this.startX - e.clientX;

        this.player.setDirection({x: Math.sign(x), y: 0});

        this.startX = e.clientX;
    }

    onMouseUp(e) {
        if (this.isDown !== e.pointerId) {
            return;
        }

        this.isDown = "none";
    }

    spawnBall() {
        const ball = new Ball(this.map.getObjectByName("Ball").clone());
        ball.setSpawnPosition(new THREE.Vector3(this.ship.model.position.x, this.ship.model.position.y + 6, this.ship.model.position.z));
        ball.initPhysics(this.physWorld);
        ball.applyTarget(this.player.body);
        this.add(ball.model);
        this.balls.push(ball);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    tick(delta) {
        if (this.controls) {
            this.controls.update();
        } else {
            this.camera.position.set(this.player.body.position.x, this.player.body.position.y + 5, this.player.body.position.z - 5);
        }

        if (this.cannonDebugRenderer) {
            this.cannonDebugRenderer.update();
        }

        this.time += delta;

        if (this.time >= 2000) {
            this.time = 0;
            this.spawnBall();
        }

        for (let ball of this.balls) {
            ball.tick(delta);
        }

        this.physWorld.tick(delta);

        this.player.tick(delta);

        App.renderer.render(this, this.camera);
    }
}