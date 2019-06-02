import { GeometryOptValue } from "../../../defs/geometry";
import { svgPropFillAndStroke } from "../../../rendering/svg-helper";
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
}

export class Arc extends BaseElement<ArcOption> {
    public svgAttrs() {
        return {
            ...svgPropFillAndStroke(this),
            d: this.getPath(),
        };
    }

    public svgTagName() { return "path"; }
    public svgTextContent() { return null; }

    private getPath() {
        return arc()
            .padAngle(this.prop.pad)({
                innerRadius: this.$geometry.r1,
                outerRadius: this.$geometry.r2,
                startAngle: toRad(this.$geometry.x1),
                endAngle: toRad(this.$geometry.x2),
            });
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            fill: "#aaa",
            pad: 0,
        };
    }

    public static geometryProps() {
        const { h, v } = super.geometryProps();
        return {
            h: [...h, "x1", "x2"],
            v: [...v, "r1", "r2"],
        };
    }

    public positionDetached = true;
}
