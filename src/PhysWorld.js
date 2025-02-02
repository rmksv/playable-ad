import * as CANNON from "cannon-es";
import * as THREE from "three";
import App from "../App";

export default class PhysWorld extends CANNON.World {
    constructor() {
        super();
        this.solver.iterations = 5;

        this.gravity.set(0, -9.81, 0);

        this.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.defaultContactMaterial.contactEquationRelaxation = 4;

        this.broadphase = new CANNON.SAPBroadphase(this);

        this.physicsMaterial = new CANNON.Material("physics");
        const physics_physics = new CANNON.ContactMaterial(this.physicsMaterial, this.physicsMaterial, {
            friction: 0.0,
            restitution: 0.3,
        });
        this.addContactMaterial(physics_physics);
    }

    addGround(water) {
        const body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            material: this.physicsMaterial,
            position: new CANNON.Vec3(water.position.x, water.position.y, water.position.z),
            quaternion: new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2),
        });
        this.addBody(body);
    }

    addLandZone(model) {
        const globalPosition = model.getWorldPosition(new THREE.Vector3());
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const shape = new CANNON.Box(new CANNON.Vec3(size.x * 0.5, size.y * 0.2, size.z * 0.1));

        const body = new CANNON.Body({
            mass: 0,
            shape: shape,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(globalPosition.x, globalPosition.y - 13.8, globalPosition.z - 7),
        });
        this.addBody(body);
    }

    addPlayer(player) {
        const globalBodyPosition = player.body.getWorldPosition(new THREE.Vector3());

        const physBody = new CANNON.Body({
            mass: 10,
            material: this.physicsMaterial,
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
            position: new CANNON.Vec3(globalBodyPosition.x, globalBodyPosition.y, globalBodyPosition.z),
        });
        physBody.addShape(new CANNON.Box(new CANNON.Vec3(0.2, 0.2, 0.2)), new CANNON.Vec3(0, 0, 0.7));
        this.addBody(physBody);

        const globalBatPosition = player.bat.getWorldPosition(new THREE.Vector3());

        const physBat = new CANNON.Body({
            mass: 1,
            material: this.physicsMaterial,
            shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 2)),
            position: new CANNON.Vec3(globalBatPosition.x, globalBatPosition.y, globalBatPosition.z),
        });
        this.addBody(physBat);

        const localPivotA = new CANNON.Vec3(0, -0.1, 1);
        const localPivotB = new CANNON.Vec3(0, 0, -2);
        const constraint = new CANNON.PointToPointConstraint(physBody, localPivotA, physBat, localPivotB);
        this.addConstraint(constraint);

        return [physBody, physBat];
    }

    addShip(ship) {
        const globalBodyPosition = ship.model.getWorldPosition(new THREE.Vector3());

        const physBody = new CANNON.Body({
            mass: 10,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(globalBodyPosition.x, globalBodyPosition.y, globalBodyPosition.z),
        });

        const shape = new CANNON.Box(new CANNON.Vec3(9, 5, 4));
        physBody.addShape(shape, new CANNON.Vec3(0, 5, 0));

        this.addBody(physBody);

        return physBody;
    }

    addBall(ball) {
        const globalPosition = ball.model.getWorldPosition(new THREE.Vector3());

        const physBody = new CANNON.Body({
            mass: 1,
            material: this.physicsMaterial,
            shape: new CANNON.Sphere(0.3),
            position: new CANNON.Vec3(globalPosition.x, globalPosition.y, globalPosition.z),
        });
        this.addBody(physBody);

        return physBody;
    }

    tick(delta) {
        this.step(1 / 60, delta);
    }
}