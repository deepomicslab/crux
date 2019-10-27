import { Behavior } from "./behavior";

interface DragOption {

}

export class Drag extends Behavior<DragOption> {
    public events = [];

    public updateProps(op: any): void {
        throw new Error("Method not implemented.");
    }
}
