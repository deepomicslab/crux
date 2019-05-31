import { GeometryOptValue } from "../../defs/geometry";
import { svgPropFillAndStroke } from "../../rendering/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

interface CircleOption extends BaseElementOption {
    r: GeometryOptValue;
}

export class Circle extends PrimitiveElement<CircleOption> {

    public svgAttrs() {
        const [cx, cy] = this.translatePoint(
            this.$geometry.x + this.$geometry.r,
            this.$geometry.y + this.$geometry.r,
        );
        return {
            ...svgPropFillAndStroke(this),
            cx, cy,
            r: this.$geometry.r,
        };
    }

    public svgTagName() { return "circle"; }
    public svgTextContent() { return null; }

    public static geometryProps() {
        const { h, v } = super.geometryProps();
        return { h: [...h, "r"], v};
    }

    public get maxX() {
        return this.$geometry.x + this.$geometry.r * 2;
    }

    public get maxY() {
        return this.$geometry.y + this.$geometry.r * 2;
    }
}
