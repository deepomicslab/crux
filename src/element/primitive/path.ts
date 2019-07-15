import { canvasFill, canvasStroke } from "../../rendering/canvas-helper";
import { svgPropFillAndStroke } from "../../rendering/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

type PathCustomRenderer = (ctx: Path2D) => void;

export interface PathOption extends BaseElementOption {
    d: string | PathCustomRenderer;
}

export class Path extends PrimitiveElement<PathOption> {
    public static propNameForInitializer(): string { return "d"; }

    public svgAttrs(): any {
        return {
            ...svgPropFillAndStroke(this),
            d: this.prop.d,
        };
    }

    public svgTagName() { return "path"; }
    public svgTextContent() { return null; }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
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
