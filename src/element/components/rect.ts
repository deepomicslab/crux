import { GeometryOptValue } from "../../defs/geometry";
import { SVGRenderable } from "../../rendering/svg";
import { svgPropFillAndStroke, svgPropXAndY } from "../../rendering/svg-helper";
import { BaseElement } from "../base-element";
import { BaseElementOption } from "./base-elm-options";

interface RectOption extends BaseElementOption {
    width: GeometryOptValue;
    height: GeometryOptValue;
}

export class Rect extends BaseElement<RectOption>
    implements SVGRenderable {

    public svgAttrs() {
        return {
            ...svgPropFillAndStroke(this),
            ...svgPropXAndY(this),
            width: this.$geometry.width,
            height: this.$geometry.height,
        };
    }

    public svgTagName() { return "rect"; }
    public svgTextContent() { return null; }

    public static geometryProps() {
        const { h, v } = super.geometryProps();
        return {
            h: [...h, "width"],
            v: [...v, "height"],
        };
    }

    public get maxX(): number {
        return this.$geometry.x + this.$geometry.width;
    }

    public get maxY(): number {
        return this.$geometry.y + this.$geometry.height;
    }
}
