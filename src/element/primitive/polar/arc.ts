import { getThemeColor } from "../../../color";
import { GeometryOptValue } from "../../../defs/geometry";
import { canvasFill, canvasStroke } from "../../../rendering/canvas/canvas-helper";
import { svgPropFillAndStroke } from "../../../rendering/svg/svg-helper";
import { toRad } from "../../../utils/math";
import { BaseElement } from "../../base-element";
import { BaseElementOption } from "../base-elm-options";

import { arc } from "d3-shape";

export interface ArcOption extends BaseElementOption {
    x1: GeometryOptValue;
    r1: GeometryOptValue;
    x2: GeometryOptValue;
    r2: GeometryOptValue;
    pad: number;
    rad: boolean;
}

export class Arc extends BaseElement<ArcOption> {
    public svgAttrs(): any {
        return {
            ...svgPropFillAndStroke(this),
            d: this.getPath(),
        };
    }

    public svgTagName() {
        return "path";
    }
    public svgTextContent() {
        return null;
    }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        this.path = new Path2D(this.getPath()!);
        canvasFill(ctx, this);
        canvasStroke(ctx, this);
    }

    private getPath() {
        const x1 = this.prop.rad ? this.$geometry.x1 : toRad(this.$geometry.x1);
        const x2 = this.prop.rad ? this.$geometry.x2 : toRad(this.$geometry.x2);
        return arc().padAngle(this.prop.pad)({
            innerRadius: this.$geometry.r1,
            outerRadius: this.$geometry.r2,
            startAngle: x1,
            endAngle: x2,
        });
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            fill: getThemeColor(this.$v.theme, "theme"),
            pad: 0,
        };
    }

    public geometryProps() {
        const { h, v } = super.geometryProps();
        return {
            h: [...h, "x1", "x2"],
            v: [...v, "r1", "r2"],
        };
    }

    public positionDetached = true;
}
