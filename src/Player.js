import * as THREE from "three";
import * as CANNON from "cannon-es";

export default class Player {
    constructor(model) {
        this.model = model;
        this.model.position.set(0, 0, 0);

        this.direction = {x: 0, y: 0};
        this.speed = 2;

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
        this.physBody = world.addPlayer(this.body);
        this.physBat = world.addBat(this.bat);

        const localPivotA = new CANNON.Vec3(0, -0.1, 1);
        const localPivotB = new CANNON.Vec3(0, 0, -2);
        const constraint = new CANNON.PointToPointConstraint(this.physBody, localPivotA, this.physBat, localPivotB);
        world.addConstraint(constraint);
    }

    setDirection(direction) {
        this.direction = direction;

        this.physBody.force.set(0, 0, 0);
        this.physBody.torque.set(0, 0, 0);
        this.physBody.angularVelocity.set(0, 0, 0);
    }

    tick(delta) {
        this.physBody.velocity.set(this.direction.x * this.speed * delta * 0.005, 0, 0);
        this.physBody.torque.set(0, this.direction.x * this.speed * delta * 0.5, 0);

        this.body.position.copy(this.physBody.position);
        this.body.quaternion.copy(this.physBody.quaternion);

        this.bat.position.copy(this.physBat.position);
        this.bat.quaternion.copy(this.physBat.quaternion);
    }
}