import { GeometryOptValue } from "../../defs/geometry";
import { getFinalPosition } from "../../layout/layout";
import { svgPropFillAndStroke } from "../../rendering/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

interface CircleOption extends BaseElementOption {
    r: GeometryOptValue;
}

export class Circle extends PrimitiveElement<CircleOption> {

    public svgAttrs() {
        const [x, y] = getFinalPosition(this);
        const r = this.$geometry.r;
        return {
            ...svgPropFillAndStroke(this),
            cx: x + r,
            cy: y + r,
            r,
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

    public get layoutWidth() { return this.$geometry.r * 2; }
    public get layoutHeight() { return this.$geometry.r * 2; }
}
