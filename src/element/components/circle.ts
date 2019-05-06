import { GeometryOptValue } from "../../defs/geometry";
import { SVGRenderable } from "../../rendering/svg";
import { svgPropFillAndStroke } from "../../rendering/svg-helper";
import { BaseElement } from "../base-element";
import { BaseElementOption } from "./base-elm-options";

interface CircleOption extends BaseElementOption {
    r: GeometryOptValue;
}

export class Circle extends BaseElement<CircleOption>
    implements SVGRenderable {

    public svgAttrs() {
        return {
            ...svgPropFillAndStroke(this),
            cx: this.$geometry.x + this.$geometry.r,
            cy: this.$geometry.y + this.$geometry.r,
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
        return this.$geometry.x + this.$geometry.r;
    }

    public get maxY() {
        return this.$geometry.y + this.$geometry.r;
    }
}
