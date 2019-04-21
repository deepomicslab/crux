import { svgPropFillAndStroke, svgPropXAndY } from "../../rendering/svg-helper";
import { BaseElement } from "../base-element";
import { BaseElementOption } from "./base-elm-options";

interface TextOptions extends BaseElementOption {
    text: string;
}

export class Text extends BaseElement<TextOptions> {
    public svgAttrs() {
        return {
            ...svgPropFillAndStroke(this),
            ...svgPropXAndY(this),
        };
    }

    public svgTagName() { return "text"; }
    public svgTextContent() {
        return this.prop.text;
    }

}
