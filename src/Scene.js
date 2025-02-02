import * as THREE from "three";
import App from "../App";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import Ship from "./Ship";
import Player from "./Player";
import CannonDebugRenderer from "./cannonDebugRenderer";
import PhysWorld from "./PhysWorld";
import Ball from "./Ball";
import * as CANNON from "cannon-es";

export default class Scene extends THREE.Scene {
    constructor() {
        super();
        this.background = new THREE.Color("#5fadd6");

        this.isDown = "none";
        this.time = 0;
        this.balls = [];
        this.isEnd = false;

        this.createChildren();
        this.initPhysics();
        this.handleEvents();
    }

    createChildren() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
        this.camera.position.set(0, 10, -10);
        this.camera.lookAt(0, 0, 3);

        // this.controls = new OrbitControls(this.camera, App.renderer.domElement);

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

        this.water.physBody = this.physWorld.addWater(this.water);
        this.physWorld.addLandZone(this.map.getObjectByName("Zones"));
        this.player.initPhysics(this.physWorld);
        this.ship.initPhysics(this.physWorld);

        // this.cannonDebugRenderer = new CannonDebugRenderer(this, this.physWorld);
    }

    handleEvents() {
        if (this.controls) {
            return;
        }
        document.addEventListener("pointerdown", this.onMouseDown.bind(this));
        document.addEventListener("pointermove", this.onMouseMove.bind(this));
        document.addEventListener("pointerup", this.onMouseUp.bind(this));
    }

    onMouseDown(e) {
        if (this.isEnd) {
            return;
        }

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
        const model = this.map.getObjectByName("Ball").clone();
        const ball = new Ball(model);
        ball.setSpawnPosition(this.ship.model.position.clone().add(new THREE.Vector3(0, 5, -5)));
        ball.initPhysics(this.physWorld);
        ball.shoot(this.player.body.position.clone().add(new THREE.Vector3((Math.random() > 0.5 ? -1 : 1) * this.player.speed, 1, -2)));
        this.add(ball.model);
        this.balls.push(ball);

        ball.physBody.addEventListener("collide", (e) => {
            this.onBallCollision(e, ball);
        });
    }

    onBallCollision(e, ball) {
        ball.physBody.removeEventListener("collide");
        ball.targetPosition = null;

        if (e.body === this.player.physBat && this.ship) {
            const direction = new THREE.Vector3().subVectors(this.ship.model.position, ball.model.position).normalize();
            const hitStrength = 1;
            const upwardBoost = 0.5;

            const impulse = new CANNON.Vec3(
                direction.x * hitStrength,
                upwardBoost,
                direction.z * hitStrength
            );

            ball.physBody.applyImpulse(impulse, ball.physBody.position);
        } else if (e.body === this.water.physBody) {
            ball.toRemove = true;
        } else if (this.ship && e.body === this.ship.physBody) {
            ball.toRemove = true;

            let hp = this.ship.removeHP();
            if (hp === 0) {
                this.isEnd = true;
                this.isDown = "none";
                this.player.setDirection({x: 0, y: 0});
            }
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    tick(delta) {
        this.physWorld.tick(delta);

        if (this.controls) {
            this.controls.update();
        } else {
            this.camera.position.set(this.player.body.position.x, 5, -10);
        }

        if (this.cannonDebugRenderer) {
            this.cannonDebugRenderer.update();
        }

        if (this.isEnd && this.ship) {
            this.physWorld.removeBody(this.ship.physBody);
            this.ship.model.parent.remove(this.ship.model);
            this.ship = null;
        }

        this.time += delta;

        if (this.time >= 2000 && !this.isEnd) {
            this.time = 0;
            this.spawnBall();
        }

        for (let ball of this.balls) {
            if (ball.toRemove) {
                this.physWorld.removeBody(ball.physBody);
                this.remove(ball.model);
                this.balls.splice(this.balls.indexOf(ball), 1);
                break;
            } else {
                ball.tick(delta);
            }
        }

        this.player.tick(delta);

        App.renderer.render(this, this.camera);
    }
}