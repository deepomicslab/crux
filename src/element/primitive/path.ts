import { getFinalPosition } from "../../layout/layout";
import { canvasFill, canvasStroke } from "../../rendering/canvas-helper";
import { svgPropFillAndStroke, svgPropXAndY } from "../../rendering/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

type PathCustomRenderer = (ctx: Path2D) => void;

export interface PathOption extends BaseElementOption {
    d: string | PathCustomRenderer;
}

export class Path extends PrimitiveElement<PathOption> {
    public static propNameForInitializer(): string { return "d"; }

    public svgAttrs(): any {
        const result = {
            ...svgPropFillAndStroke(this),
            ...svgPropXAndY(this),
            d: this.prop.d,
        };
        if (this.$geometry.x !== 0 || this.$geometry.y !== 0) {
            result.transform = `translate(${this.$geometry.x},${this.$geometry.y})`;
        }
        return result;
    }

    public svgTagName() { return "path"; }
    public svgTextContent() { return null; }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        const [x, y] = getFinalPosition(this);
        ctx.translate(x, y);

        switch (typeof this.prop.d) {
            case "string":
                this.path = new Path2D(this.prop.d);
                break;
            case "function":
                this.path = new Path2D();
                (this.prop.d as PathCustomRenderer).call(null, this.path);
                break;
            default:
                throw new Error(`Path: d must be a string or a functon.`);
        }
        canvasFill(ctx, this);
        canvasStroke(ctx, this);
    }

    public positionDetached = true;
}
