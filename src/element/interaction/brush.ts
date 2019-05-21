import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

import { scaleLinear } from "d3-scale";

export interface BrushOption extends ComponentOption {
    range: [number, number];
    cornerRadius: number;
    onBrushEnd: () => void;
    onBrushUpdate: () => void;
    onBrushStart: () => void;
}

export class Brush extends Component<BrushOption> {
    public defaultProp() {
        return {
            ...super.defaultProp(),
            cornerRadius: 0,
        };
    }

    public render = template`
    Component {
        @let x = brushX()
        @let y = brushY()
        @let w = brushWidth()
        @let h = brushHeight()

        Rect {
            x = 0; y = 0; width = 100%; height = 100%
            fill = "rgba(0,0,0,0)"
        }
        Rect {
            ref = "mainBrush"
            x = x
            y = y
            width = w
            height = h
            fill = "rgba(200,200,200,.4)"
            stroke = "rgba(20,20,20,.6)"
            cornerRadius = prop.cornerRadius
            style:cursor = "move"
            on:mousedown = handleDown($ev, 2)
        }
        Rect {
            ref = "leftHandle"
            x = x - 3
            width = 6
            height = 100%
            fill = "rgba(0,0,0,0)"
            style:cursor = "ew-resize"
            on:mousedown = handleDown($ev, 0)
        }
        Rect {
            ref = "rightHandle"
            x = x + w - 3
            width = 6
            height = 100%
            fill = "rgba(0,0,0,0)"
            style:cursor = "ew-resize"
            on:mousedown = handleDown($ev, 1)
        }
    }
    `;

    public get dataRange(): [number, number] {
        return [this._brushScale(this.state.brushL), this._brushScale(this.state.brushR)];
    }

    private _inited = false;
    private _isMoving = false;
    private _moveType: number; // 0: left, 1: right, 2: brush
    private _brushScale: d3.ScaleContinuousNumeric<number, number>;
    private _lastX = 0;

    private _bodyUpListener: any;
    private _bodyMoveListener: any;

    protected state = {
        brushL: 0,
        brushR: 0,
    };

    public didCreate() {
        this._brushScale = scaleLinear().range(this.prop.range);
    }

    public didLayout() {
        if (!this._inited) {
            const w = this.$geometry.width;
            this.state.brushL = 0;
            this.state.brushR = w;
            this._brushScale.domain([0, w]);
            this._inited = true;
        }
    }

    public $setCurrentRange(l: number, r: number) {
        const i = this._brushScale.invert;
        this.state.brushL = i(l);
        this.state.brushR = i(r);
    }

    private brushX(): number {
        return this.state.brushL;
    }

    private brushY(): number {
        return 0;
    }

    private brushWidth(): number {
        return this.state.brushR - this.state.brushL;
    }

    private brushHeight(): number {
        return this.$geometry.height;
    }

    private handleDown(e: MouseEvent, type: number) {
        this._isMoving = true;
        this._moveType = type;
        this._lastX = e.clientX;
        this._bodyUpListener = this.handleUp.bind(this);
        this._bodyMoveListener = this.handleMove.bind(this);
        document.body.addEventListener("mouseup", this._bodyUpListener);
        document.body.addEventListener("mousemove", this._bodyMoveListener);
        this._callListener("onBrushStart");
    }

    private handleUp(e: MouseEvent) {
        this._isMoving = false;
        document.body.removeEventListener("mouseup", this._bodyUpListener);
        this._callListener("onBrushEnd");
    }

    private handleMove(e: MouseEvent) {
        if (!this._isMoving) return;
        const offset = e.clientX - this._lastX;
        this._lastX = e.clientX;
        if (offset === 0) return;

        const l = this.state.brushL + offset;
        const r = this.state.brushR + offset;

        switch (this._moveType) {
            case 0:
                if (l < 0) return;
                this.setState({ brushL: l });
                break;
            case 1:
                if (r > this.$geometry.width) return;
                this.setState({ brushR: r });
                break;
            case 2:
                if (l < 0 || r > this.$geometry.width) return;
                this.setState({ brushL: l, brushR: r });
                break;
        }

        this._callListener("onBrushUpdate");
    }

    private _callListener(name: "onBrushStart" | "onBrushEnd" | "onBrushUpdate") {
        if (this.prop[name])
            this.prop[name].call(null, this.dataRange);
    }
}
