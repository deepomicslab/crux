import { GeometryOptValue } from "../../defs/geometry";
import { getFinalPosition } from "../../layout/layout";
import { canvasRotate } from "../../rendering/canvas/canvas-helper";
import { svgRotation } from "../../rendering/svg/svg-helper";
import { BaseElement } from "../base-element";
import { BaseElementOption } from "./base-elm-options";

export interface BitMapImageOption extends BaseElementOption {
    width: GeometryOptValue;
    height: GeometryOptValue;
    url: string;
}

export class BitMapImage extends BaseElement<BitMapImageOption> {
    private image!: HTMLImageElement;

    private getURL() {
        const { url } = this.prop;
        if (!url) {
            throw Error("Image: image should have a url prop");
        }
        return url;
    }

    private getImage() {
        const url = this.getURL();
        if (!url.startsWith("data:")) {
            throw Error(`Image: drawing a remote image to canvas is not suppported yet. You should provide a data URL`);
        }
        this.image = new Image();
        this.image.src = url;
    }

    public svgTagName() {
        return "image";
    }

    public svgAttrs(): Record<string, string | number | boolean> {
        const [x, y] = getFinalPosition(this);
        const { width, height } = this.$geometry;
        return {
            href: this.getURL(),
            ...svgRotation(this),
            x,
            y,
            width,
            height,
        };
    }

    public svgTextContent(): string | null {
        return null;
    }

    public renderToCanvas(ctx: CanvasRenderingContext2D) {
        this.getImage();
        canvasRotate(ctx, this);
        const [x, y] = getFinalPosition(this as any);
        const { width, height } = this.$geometry;
        ctx.drawImage(this.image, x, y, width, height);
    }

    public geometryProps() {
        const { h, v } = super.geometryProps();
        return {
            h: [...h, "width"],
            v: [...v, "height"],
        };
    }
}
