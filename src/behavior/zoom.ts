import mouse from "../utils/mouse";
import { Behavior } from "./behavior";

export interface ZoomOption {
    direction?: "x" | "y" | "xy" | "native";
    rangeX: [number, number];
    rangeY: [number, number];
    currentRangeX?: [number, number];
    currentRangeY?: [number, number];
    minResolution: number;
    factor?: number;
    onZoom?: (range: [number, number]) => void;
}

export default class Zoom extends Behavior<ZoomOption> {
    private direction!: "x" | "y" | "xy" | "native";
    public rangeX!: [number, number];
    public rangeY!: [number, number];
    public currRangeX!: [number, number];
    public currRangeY!: [number, number];
    public sizeX?: [number, number];
    public sizeY?: [number, number];
    public minResolution!: number;
    public factor = 1;

    public handler?: (range: [number, number]) => void;

    private isMoving = false;
    private mousePos: [number, number] = [0, 0];

    public init(op: ZoomOption) {
        this.direction = op.direction || "x";
        switch (this.direction) {
            case "x":
                this.rangeX = this.currRangeX = op.rangeX;
                break;
            case "y":
                this.rangeY = this.currRangeY = op.rangeY;
                break;
            case "xy":
                this.rangeX = this.currRangeX = op.rangeX;
                this.rangeY = this.currRangeY = op.rangeY;
                break;
        }
        if (this.direction !== "native" && !this.rangeX && !this.rangeY) {
            throw Error(`Zoom: range expected`);
        }
        this.minResolution = op.minResolution || 1;
        this.handler = op.onZoom;
        this.factor = op.factor || 1;
    }

    public events = ["wheel", "mousedown", "mousemove", "mouseup"];

    public updateProps(op: Partial<ZoomOption>) {
        if (op.currentRangeX) this.currRangeX = op.currentRangeX;
        if (op.currentRangeY) this.currRangeY = op.currentRangeY;
        if (op.minResolution) this.minResolution = op.minResolution;
    }

    public wheel(ev: WheelEvent) {
        ev.stopPropagation();
        ev.preventDefault();
        const gSize = this.sizeX || [0, (this.el.$geometry as any).width];
        const gWidth = gSize[1] - gSize[0];
        const currWidth = this.currRangeX[1] - this.currRangeX[0];
        const origWidth = this.rangeX[1] - this.rangeX[0];
        const maxK = origWidth / (this.minResolution * gWidth);
        const currK = origWidth / currWidth;

        const delta = ev.deltaY;
        let k = currK - delta * this.factor * 0.05;
        if (k < 1) k = 1;
        if (k > maxK) k = maxK;
        if (currK === k) return;

        const mousePos = mouse(this.el, ev);
        const kx = (mousePos[0] - gSize[0]) / gWidth;
        const anchor = this.currRangeX[0] + currWidth * kx;
        const len = (this.rangeX[1] - this.rangeX[0]) / k;
        this.updateRange(anchor - kx * len, anchor + (1 - kx) * len);
        if (this.handler) {
            this.el.$v.transaction(() => {
                this.handler!.call(this.el, this.currRangeX);
            });
        }
    }

    public mousedown(ev: MouseEvent) {
        this.isMoving = true;
        this.mousePos = mouse(this.el, ev);
    }

    public mousemove(ev: MouseEvent) {
        if (!this.isMoving) return;
        const m = mouse(this.el, ev);
        const gSize = this.sizeX || [0, (this.el.$geometry as any).width];
        const gWidth = gSize[1] - gSize[0];
        const currWidth = this.currRangeX[1] - this.currRangeX[0];
        const delta = (this.mousePos[0] - m[0]) * (currWidth / gWidth);
        this.updateRange(this.currRangeX[0] + delta, this.currRangeX[1] + delta);
        this.mousePos = m;
        if (this.handler) {
            this.el.$v.transaction(() => {
                this.handler!.call(this.el, this.currRangeX);
            });
        }
    }

    public mouseup = (ev: MouseEvent) => {
        this.isMoving = false;
    }

    private updateRange(l: number, r: number) {
        if (l < this.rangeX[0]) {
            const o = this.rangeX[0] - l; l += o; r += o;
        }
        if (r > this.rangeX[1]) {
            const o = r - this.rangeX[1]; l -= o; r -= o;
        }

        this.currRangeX = [l, r];
    }
}
