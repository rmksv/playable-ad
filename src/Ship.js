import * as THREE from "three";

export default class Ship {
    constructor(model) {
        this.model = model;

        this.init();
    }

    init() {
        this.model.position.set(-10, -15, 50);
    }

    initPhysics(world) {
        this.physBody = world.addShip(this);
    }
}