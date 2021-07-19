import mouse from "../utils/mouse";
import { Behavior } from "./behavior";

export interface DragOption {
    direction?: "x" | "y" | "xy" | "native";
    factor?: number;
    validRangeX?: [number, number];
    validRangeY?: [number, number];
    onDrag?: (ev: MouseEvent, deltaPos: [number, number],
              offsetPos: [number, number]) => void;
    updateDelta?: (newPos: [number, number], oldPos: [number, number])
            => [number, number];
}

export default class Drag extends Behavior<DragOption> {
    private direction!: "x" | "y" | "xy" | "native";

    public factor = 1;
    // @ts-ignore
    public validRangeX: [number, number];
    // @ts-ignore
    public validRangeY: [number, number];

    public handler?: (ev: MouseEvent, deltaPos: [number, number],
                      offsetPos: [number, number]) => void;
    public updateDelta?: (newPos: [number, number], oldPos: [number, number])
                            => [number, number];

    private deltaX: number = 0;
    private deltaY: number = 0;
    private isMoving: boolean = false;
    private mousePos: [number, number] = [0, 0];

    public init(op: DragOption) {
        this.direction = op.direction || "xy";
        if (this.direction === "native" && !this.updateDelta)
            throw Error(`Drag: native updateDelta expected`);
        this.deltaX = this.deltaY = 0;
        this.handler = op.onDrag;
    }

    public updateProps(op: Partial<DragOption>) {
        // not implemented
    }

    public events = ["mousedown", "mousemove", "mouseup"];

    public mousedown(ev: MouseEvent) {
        this.isMoving = true;
        ev.stopPropagation();
        ev.preventDefault();
        if (this.el.$parent) {
            this.mousePos = mouse(this.el.$parent, ev);
        } else {
            this.mousePos = [ev.offsetX, ev.offsetY];
        }
    }

    public mousemove(ev: MouseEvent) {
        if (!this.isMoving)
            return;
        let m;
        if (this.el.$parent) {
            m = mouse(this.el.$parent, ev);
            if (!!this.validRangeX)
                if (m[0] > this.validRangeX[1] || m[0] < this.validRangeX[0]) {
                    this.mouseup();
                    return;
                }
            if (!!this.validRangeY)
                if (m[1] > this.validRangeY[1] || m[1] < this.validRangeY[0]) {
                    this.mouseup();
                    return;
                }
        } else {
            m = [ev.offsetX, ev.offsetY];
        }
        switch (this.direction) {
            case "x":
                this.deltaX = m[0] - this.mousePos[0];
                break;
            case "y":
                this.deltaY = m[1] - this.mousePos[1];
                break;
            case "xy":
                this.deltaX = m[0] - this.mousePos[0];
                this.deltaY = m[1] - this.mousePos[1];
                break;
            case "native":
                // @ts-ignore
                const result = this.updateDelta(m, this.mousePos);
                this.deltaX = result[0];
                this.deltaY = result[1];
                break;
        }
        if (this.el.$parent) {
            this.mousePos = mouse(this.el.$parent, ev);
        } else {
            this.mousePos = [ev.offsetX, ev.offsetY];
        }
        this.el.$v.transaction(() => {
            this.handler!.call(this.el, ev, [this.deltaX, this.deltaY], this.mousePos);
        });
    }
    public mouseup() {
        this.isMoving = false;
    }
}
