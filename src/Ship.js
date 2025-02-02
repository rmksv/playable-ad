import * as THREE from "three";

export default class Ship {
    constructor(model) {
        this.model = model;
        this.hp = 5;

        this.init();
    }

    init() {
        this.model.position.set(-10, -15, 50);
    }

    initPhysics(world) {
        this.physBody = world.addShip(this.model);
    }

    removeHP() {
        this.hp -= 1;
        
        return this.hp;
    }
}