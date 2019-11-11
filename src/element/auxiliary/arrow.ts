import { Component } from "..";
import { GeometryOptValue } from "../../defs/geometry";
import { useTemplate } from "../../ext/decorator";
import { ComponentOption } from "../component-options";

export interface ArrowOption extends ComponentOption {
    x2: GeometryOptValue;
    y2: GeometryOptValue;
}

@useTemplate(`
Component {
    Line {
        x2 = _x2
        y2 = _y2
        @props prop.opt.shaft
    }
    Triangle {
        anchor = @anchor("bottom", "center")
        x = _x2
        y = _y2
        fill = @color("line")
        rotation = @rotate(_angle)
        @props prop.opt.head
    }
}
`)
export class Arrow extends Component<ArrowOption> {
    public geometryProps() {
        const { h, v } = super.geometryProps();
        return {
            h: [...h, "x2"],
            v: [...v, "y2"],
        };
    }

    private _x2!: number;
    private _y2!: number;
    // @ts-ignore
    private _angle!: number;

    public willRender() {
        const { x, y, x2, y2 } = this.$geometry;
        this._x2 = x2 - x; this._y2 = y2 - y;
        this._angle = (this._y2 >= 0 ? 180 : 0) - Math.atan(this._x2 / this._y2) * 180 / Math.PI;
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            x2: 100,
            y2: 0,
            width: 0,
            height: 0,
        };
    }
}
