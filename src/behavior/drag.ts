import { BaseElement } from "../element";
import { Behavior } from "./behavior";

interface DragOption {

}

export class Drag extends Behavior {
    constructor(public el: BaseElement, op: DragOption) {
        super();
        if (typeof op !== "object")
            throw new Error(`Zoom: option must be an object`);

    }

    public events = [];

    public updateProps(op: any): void {
        throw new Error("Method not implemented.");
    }
}
