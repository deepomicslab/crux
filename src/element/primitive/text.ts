import { getFinalPosition } from "../../layout/layout";
import { canvasFill, canvasStroke } from "../../rendering/canvas-helper";
import { svgInnerHTML, svgPropFillAndStroke, svgPropPassthrough } from "../../rendering/svg-helper";
import { measuredTextSize } from "../../utils/text-size";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

interface TextOption extends BaseElementOption {
    text: any;
    html: string;
    fontSize: number;
    fontFamily: string;
}

export class Text extends PrimitiveElement<TextOption> {
    public $cachedWidth!: number;
    public $cachedHeight!: number;

    public static propNameForInitializer(): string { return "text"; }

    public defaultProp(): any {
        return { fontSize: 12 };
    }

    public willAdjustAnchor() {
        const text = (typeof this.prop.text === "string") ? this.prop.text :
            ((this.prop.text || this.prop.text === 0) && this.prop.text.toString) ? this.prop.text.toString() :
            (this.prop.html && this.prop.html.toString) ? strip(this.prop.html.toString()) : null;

        if (text === null) {
            throw new Error(`Text: you must supply either "text" or "html".`);
        }

        const box = measuredTextSize(text, this.prop.fontSize, this.prop.fontFamily);
        this.$cachedHeight = box.height;
        this.$cachedWidth = box.width;
    }

    public svgAttrs(): any {
        const [x, y] = getFinalPosition(this);
        return {
            ...svgPropFillAndStroke(this),
            ...svgInnerHTML(this),
            ...svgPropPassthrough({
                "font-size": "fontSize",
                "font-family": "fontFamily",
            })(this),
            x,
            y: y + this.$cachedHeight,
        };
    }

    public svgTagName() { return "text"; }
    public svgTextContent() {
        return this.prop.text;
    }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        const [x, y] = getFinalPosition(this);
        ctx.beginPath();
        canvasFill(ctx, this, true);
        canvasStroke(ctx, this, true);
        if (this.prop.fontSize) {
            ctx.font = `${this.prop.fontSize}px ${this.prop.fontFamily || "Arial"}`;
        }
        ctx.fillText(this.prop.text, x, y + this.$cachedHeight);
        if (this.prop.stroke) ctx.strokeText(this.prop.text, x, y + this.$cachedHeight);
    }

    public get maxX() {
        return this.$geometry._x + this.$cachedWidth;
    }

    public get maxY() {
        return this.$geometry._y + this.$cachedHeight;
    }

    public get layoutWidth() { return this.$cachedWidth; }
    public get layoutHeight() { return this.$cachedHeight; }
}

function strip(html: string): string {
    return html.replace(/<\/?.+?>/g, "");
}
