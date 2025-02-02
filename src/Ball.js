import * as THREE from "three";
import * as CANNON from "cannon-es";

export default class Ball {
    constructor(model) {
        this.model = model;
        this.speed = 2;
    }

    setSpawnPosition(p) {
        this.model.position.copy(p);
    }

    initPhysics(world) {
        this.world = world;
        this.physBody = world.addBall(this.model);
    }

    shoot(targetPosition) {
        this.targetPosition = targetPosition;
        this.physBody.torque.set(Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5);
    }

    tick(delta) {
        if (this.targetPosition) {
            const direction = new THREE.Vector3().subVectors(this.targetPosition, this.model.position).normalize();

            const distance = this.model.position.distanceTo(this.targetPosition);

            if (distance > this.speed * 2) {
                this.physBody.velocity.set(
                    direction.x * this.speed,
                    direction.y * this.speed * Math.abs(this.world.gravity.y),
                    direction.z * this.speed
                );
            } else {
                const directionToTarget = new CANNON.Vec3(direction.x, direction.y, direction.z);
                const attractionStrength = 1 / (distance ** 2);
                this.physBody.applyForce(directionToTarget.scale(attractionStrength), this.physBody.position);
            }
        }

        this.model.position.copy(this.physBody.position);
        this.model.quaternion.copy(this.physBody.quaternion);
    }
}