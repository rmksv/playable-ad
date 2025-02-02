import * as THREE from "three";

export default class Ball {
    constructor(model) {
        this.model = model;
    }

    setSpawnPosition(p) {
        this.model.position.copy(p);
    }

    initPhysics(world) {
        this.physBody = world.addBall(this);
    }

    applyTarget(target) {
        this.target = target;
    }

    tick(delta) {
        this.model.position.copy(this.physBody.position);
        this.model.quaternion.copy(this.physBody.quaternion);
    }
}