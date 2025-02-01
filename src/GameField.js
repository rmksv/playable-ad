import * as THREE from "three";
import App from "../App";

export default class GameField extends THREE.Group {
    constructor() {
        super();
        this.createChildren();
    }

    createChildren() {
        this.map = App.getModel("map");
        this.add(this.map);
    }

    tick() {

    }
}