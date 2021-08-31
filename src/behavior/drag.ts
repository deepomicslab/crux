import { BaseElement } from "../element";
import { tooltip } from "../utils";
import mouse from "../utils/mouse";
import { Behavior } from "./behavior";

export interface DragOption {
    direction?: "x" | "y" | "xy" | "polar" |"native";
    factor?: number;
    validRangeX?: [number, number];
    validRangeY?: [number, number];
    onDrag?: (ev: MouseEvent, el: BaseElement, deltaPos: [number, number],
              offsetPos: [number, number]) => void;
    onDragStart?: (ev: MouseEvent, el: BaseElement, offsetPos: [number, number]) => void;
    onDragEnd?: (ev: MouseEvent, el: BaseElement, offsetPos: [number, number]) => void;
    updateDelta?: (newPos: [number, number], oldPos: [number, number])
            => [number, number];
    debug?: boolean;
    // isSvg?: boolean;
    canvasId?: string;
    origin?: [number, number];
}

export default class Drag extends Behavior<DragOption> {
    private direction!: "x" | "y" | "xy" | "polar" | "native";
    public factor = 1;
    private origin?: [number, number];
    // @ts-ignore
    private validRangeX: [number, number];
    // @ts-ignore
    private validRangeY: [number, number];
    // @ts-ignore
    // private isSvg: boolean;

    public startHandler?: (ev: MouseEvent, el: BaseElement, offsetPos: [number, number]) => void;
    public endHandler?: (ev: MouseEvent, el: BaseElement, offsetPos: [number, number]) => void;
    public handler?: (ev: MouseEvent, el: BaseElement, deltaPos: [number, number],
                      offsetPos: [number, number]) => void;
    public updateDelta?: (newPos: [number, number], oldPos: [number, number])
                            => [number, number];

    private deltaX: number = 0;
    private deltaY: number = 0;
    private isMoving: boolean = false;
    private mousePos: [number, number] = [0, 0];

    private canvasDiv?: any;
    private _bodyUpListener: any;
    private _bodyMoveListener: any;
    private debug?: boolean;

    public init(op: DragOption) {
        this.direction = op.direction || "xy";
        this.el.setProp({cursor: "grab"});
        if (this.direction === "polar" && !op.origin) {
            throw Error(`Drag: origin expected`);
        }
        if (this.direction === "native" && !op.updateDelta)
            throw Error(`Drag: native updateDelta expected`);
        // if (!!op.isSvg) this.isSvg = op.isSvg;
        // else {
        //     const canvas = document.getElementById(op.canvasId || "canvas") as HTMLElement;
        //     if (canvas.children[0] instanceof HTMLCanvasElement)
        //         this.isSvg = false;
        //     else this.isSvg = true;
        // }
        this.deltaX = this.deltaY = 0;
        this.origin = op.origin;
        this.handler = op.onDrag;
        this.startHandler = op.onDragStart;
        this.endHandler = op.onDragEnd;
        this.validRangeX = op.validRangeX!;
        this.validRangeY = op.validRangeY!;
        this.debug = op.debug || false;
        this._bodyMoveListener = (e: any) => this.mousemove(e);
        this._bodyUpListener = (e: any) => this.mouseup(e);
        if (op.canvasId) this.canvasDiv = document.getElementById(op.canvasId);
    }

    public updateProps(op: Partial<DragOption>) {
        // not implemented
    }

    public events = ["mousedown", "mouseup"];

    public mousedown(ev: MouseEvent) {
        if (this.debug) {
            console.log("drag start");
            console.log(`origin: ${this.origin}`);
        }
        this.isMoving = true;
        ev.stopPropagation();
        ev.preventDefault();
        // if (this.isSvg && this.el.$parent) {
        if (this.el.$parent) {
            this.mousePos = mouse(this.el.$parent, ev);
        } else {
            this.mousePos = [ev.offsetX, ev.offsetY];
        }
        if (this.canvasDiv)
            this.canvasDiv.addEventListener("mousemove", this._bodyMoveListener);
        else
            document.body.addEventListener("mousemove", this._bodyMoveListener);
        this.el.$v.transaction(() => {
            this.startHandler?.call(this.el, ev, this.el, this.mousePos);
        });
        tooltip.disable();
    }

    protected getPolarPos(mousePos: [number, number]): [number, number] {
        // @ts-ignore
        mousePos[0] = mousePos[0] - this.origin[0];
        // @ts-ignore
        mousePos[1] = mousePos[1] - this.origin[1];
        return mousePos;
    }

    protected mousemove(ev: MouseEvent) {
        if (!this.isMoving)
            return;
        let m: [number, number];
        // if (this.isSvg && this.el.$parent) {
        if (this.el.$parent) {
            m = mouse(this.el.$parent, ev);
            if (!!this.validRangeX)
                if (m[0] > this.validRangeX[1] || m[0] < this.validRangeX[0]) {
                    this.mouseup(ev);
                    return;
                }
            if (!!this.validRangeY)
                if (m[1] > this.validRangeY[1] || m[1] < this.validRangeY[0]) {
                    this.mouseup(ev);
                    return;
                }
        } else {
            m = [ev.offsetX, ev.offsetY];
        }
        document.body.addEventListener("mouseup", this._bodyUpListener);
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
        this.mousePos = m;
        this.el.$v.transaction(() => {
            if (this.direction === "polar") {
                this.handler!.call(this.el, ev, this.el, [this.deltaX, this.deltaY],
                    [this.getAngle(...this.getPolarPos(this.mousePos)), 0]);
            } else {
                this.handler!.call(this.el, ev, this.el, [this.deltaX, this.deltaY],
                    this.mousePos);
            }
        });
    }
    private getAngle(a: number, b: number): number {
        const c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
        return Math.asin(b / c);
    }
    public mouseup(ev: MouseEvent) {
        if (this.isMoving) {
            this.isMoving = false;
            tooltip.enable();
            this.el.$v.transaction(() => {
                this.endHandler?.call(this.el, ev, this.el, this.mousePos);
            });
            if (this.debug) console.log("drag end");
        } else if (this.debug) {
            console.log("drag already ended");
        }
    }

}
