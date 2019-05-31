import { svgInnerHTML, svgPropFillAndStroke, svgPropPassthrough } from "../../rendering/svg-helper";
import { measuredTextSize } from "../../utils/text-size";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

interface TextOption extends BaseElementOption {
    text: string;
    html: string;
    fontSize: number;
}

export class Text extends PrimitiveElement<TextOption> {
    public $cachedWidth: number;
    public $cachedHeight: number;

    public static propNameForInitializer(): string { return "text"; }

    public defaultProp(): any {
        return { fontSize: 12 };
    }

    public willAdjustAnchor() {
        const text = (this.prop.text && this.prop.text.toString) ? this.prop.text.toString() :
            (this.prop.html && this.prop.html.toString) ? strip(this.prop.html.toString()) : null;

        if (text === null) {
            throw new Error(`Text: you must supply either "text" ot "html".`);
        }

        const box = measuredTextSize(text, this.prop.fontSize);
        this.$cachedHeight = box.height;
        this.$cachedWidth = box.width;
    }

    public svgAttrs() {
        const [x, y] = this.translatePoint(
            this.$geometry.x,
            this.$geometry.y + this.$cachedHeight,
        );
        return {
            ...svgPropFillAndStroke(this),
            ...svgInnerHTML(this),
            ...svgPropPassthrough({
                "font-size": "fontSize",
            })(this),
            x, y,
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

function strip(html: string): string {
    return html.replace(/<\/?.+?>/g, "");
}
