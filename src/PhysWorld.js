import * as CANNON from "cannon-es";
import * as THREE from "three";
import App from "../App";

export default class PhysWorld extends CANNON.World {
    constructor() {
        super();
        this.solver.iterations = 5;

        this.gravity.set(0, -2, 0);

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

    addWater(model) {
        const body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            material: this.physicsMaterial,
            position: new CANNON.Vec3(model.position.x, model.position.y, model.position.z),
            quaternion: new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2),
        });
        this.addBody(body);
        return body;
    }

    addLandZone(model) {
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const shape = new CANNON.Box(new CANNON.Vec3(size.x * 0.5, size.y * 0.2, size.z * 0.1));

        const body = new CANNON.Body({
            mass: 0,
            shape: shape,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(model.position.x, model.position.y - 13.8, model.position.z - 7),
        });
        this.addBody(body);

        return body;
    }

    addPlayer(model) {
        const body = new CANNON.Body({
            mass: 10,
            material: this.physicsMaterial,
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
            position: new CANNON.Vec3(model.position.x, model.position.y, model.position.z),
        });
        body.addShape(new CANNON.Box(new CANNON.Vec3(0.2, 0.2, 0.2)), new CANNON.Vec3(0, 0, 0.7));

        this.addBody(body);

        return body;
    }

    addBat(bat) {
        const body = new CANNON.Body({
            mass: 1,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(bat.position.x, bat.position.y, bat.position.z),
            shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 2)),
        });
        this.addBody(body);

        return body;
    }

    addShip(model) {
        const body = new CANNON.Body({
            mass: 0,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(model.position.x, model.position.y, model.position.z),
        });

        const shape = new CANNON.Box(new CANNON.Vec3(9, 5, 4));
        body.addShape(shape, new CANNON.Vec3(0, 5, 0));

        this.addBody(body);

        return body;
    }

    addBall(model) {
        const body = new CANNON.Body({
            mass: 0.1,
            material: this.physicsMaterial,
            shape: new CANNON.Sphere(0.3),
            position: new CANNON.Vec3(model.position.x, model.position.y, model.position.z),
        });
        this.addBody(body);

        return body;
    }

    tick(delta) {
        this.step(1 / 60, delta);
    }
}