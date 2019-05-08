import { GeometryOptValue } from "../../defs/geometry";
import { svgPropFillAndStroke, svgPropPassthrough, svgPropXAndY } from "../../rendering/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

interface RectOption extends BaseElementOption {
    width: GeometryOptValue;
    height: GeometryOptValue;
    minWidth: number;
    minHeight: number;
    cornerRadius: number;
}

export class Rect extends PrimitiveElement<RectOption> {

    public svgAttrs() {
        return {
            ...svgPropFillAndStroke(this),
            ...svgPropXAndY(this),
            ...svgPropPassthrough({
                rx: "cornerRadius",
                ry: "cornerRadius",
            })(this),
            width: this._widthWithMin(),
            height: this._heightWithMin(),
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

    private _widthWithMin(): number {
        return "minWidth" in this.prop && this.prop.minWidth > 0 ?
            Math.max(this.$geometry.width, this.prop.minWidth) :
            this.$geometry.width;
    }

    private _heightWithMin(): number {
        return "minHeight" in this.prop && this.prop.minWidth > 0 ?
            Math.max(this.$geometry.height, this.prop.minHeight) :
            this.$geometry.height;
    }
}
