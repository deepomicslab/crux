import { svgPropFillAndStroke, svgPropXAndY } from "../../rendering/svg-helper";
import { measuredTextSize } from "../../utils/text-size";
import { BaseElement } from "../base-element";
import { BaseElementOption } from "./base-elm-options";

interface TextOptions extends BaseElementOption {
    text: string;
}

export class Text extends BaseElement<TextOptions> {
    public $cachedWidth: number;
    public $cachedHeight: number;

    public didLayout() {
        const box = measuredTextSize(this.prop.text);
        this.$cachedHeight = box.height;
        this.$cachedWidth = box.width;
    }

    public svgAttrs() {
        return {
            ...svgPropFillAndStroke(this),
            x: this.$geometry.x,
            y: this.$geometry.y + this.$cachedHeight,
        };
    }

    public svgTagName() { return "text"; }
    public svgTextContent() {
        return this.prop.text;
    }

    public get maxX() {
        return this.$geometry.x + this.$cachedWidth;
    }

    public get maxY() {
        return this.$geometry.y + this.$cachedHeight;
    }
}
