import { GeometryOptValue } from "../../defs/geometry";
import { svgPropFillAndStroke, svgPropPassthrough } from "../../rendering/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

export interface LineOption extends BaseElementOption {
    x1: GeometryOptValue;
    x2: GeometryOptValue;
    y1: GeometryOptValue;
    y2: GeometryOptValue;
    shapeRendering: string;
    dashArray: string;
}

export class Line extends PrimitiveElement<LineOption> {

    public svgAttrs() {
        return {
            ...svgPropFillAndStroke(this),
            ...svgPropPassthrough({
                "shape-rendering": "shapeRendering",
                "stroke-dasharray": "dashArray",
            })(this),
            x1: this.$geometry.x1,
            x2: this.$geometry.x2,
            y1: this.$geometry.y1,
            y2: this.$geometry.y2,
        };
    }

    public svgTagName() { return "line"; }
    public svgTextContent() { return null; }

    public static geometryProps() {
        const { h, v } = super.geometryProps();
        return {
            h: [...h, "x1", "x2"],
            v: [...v, "y1", "y2"],
        };
    }

    public positionDetached = true;
}
