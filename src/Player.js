import * as THREE from "three";
import * as CANNON from "cannon-es";

//start
export default class Player {
    constructor(model) {
        this.model = model;
        this.model.position.set(0, 0, 0);

        this.direction = {x: 0, y: 0};
        this.speed = 1;

        this.init();
    }

    init() {
        this.bat = this.model.getObjectByName("Bit_container");
        this.bat.position.set(0, 0, 0);
        this.bat.traverse(child => {
            if (child.isMesh) {
                child.position.z -= 2;
            }
        });

        this.body = this.model.getObjectByName("Boy");
        this.body.position.set(0, 0, -5);
    }

    initPhysics(world) {
        const bodies = world.addPlayer(this);

        this.physBody = bodies[0];
        this.physBat = bodies[1];
    }

    setDirection(direction) {
        this.direction = direction;

        this.physBody.force.set(0, 0, 0);
        this.physBody.angularVelocity.set(0, 0, 0);
        this.physBody.torque.set(0, 0, 0);
    }

    tick(delta) {
        this.physBody.velocity.x = this.direction.x * this.speed * delta * 0.01;
        this.physBody.velocity.y = 0;
        this.physBody.velocity.z = 0;

        this.physBat.torque.x = 0;
        this.physBat.torque.y = this.direction.x * this.speed * delta;
        this.physBat.torque.z = 0;

        this.body.position.copy(this.physBody.position);
        this.body.quaternion.copy(this.physBody.quaternion);

        this.bat.position.copy(this.physBat.position);
        this.bat.quaternion.copy(this.physBat.quaternion);
    }
}