import * as d3c from "d3-color";

import { BaseElement, Component, ComponentOption } from "../element";
import { BaseElementOption } from "../element/primitive/base-elm-options";

export function canvasClip(ctx: CanvasRenderingContext2D, elm: Component<ComponentOption>) {
    let v: any;
    if (v = elm.prop.clip) {
        if (v.type === "bound") {
            ctx.beginPath();
            ctx.rect(0, 0, elm.$geometry.width, elm.$geometry.height);
            ctx.clip();
        } else {
            throw new Error(`Clip: unknown type "${v.type}"`);
        }
    }
}

export function canvasFill(ctx: CanvasRenderingContext2D, elm: BaseElement<BaseElementOption>, setOnly: boolean = false) {
    let f, v: any;
    if ((f = elm.prop.fill) && f !== "none") {
        if (v = elm.prop.fillOpacity) {
            const color = d3c.color(f)!.rgb();
            ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.opacity * v})`;
        } else {
            ctx.fillStyle = f;
        }
        if (setOnly) return;
        if (elm.path) {
            ctx.fill(elm.path);
        } else {
            ctx.fill();
        }
    }
}

export function canvasStroke(ctx: CanvasRenderingContext2D, elm: BaseElement<BaseElementOption>, setOnly: boolean = false) {
    let f, v: any;
    if ((f = elm.prop.stroke) && f !== "none") {
        if (v = elm.prop.strokeOpacity) {
            const color = d3c.color(f)!.rgb();
            ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.opacity * v})`;
        } else {
            ctx.strokeStyle = f;
        }
        if (v = elm.prop.strokeWidth) {
            ctx.lineWidth = v;
        } else {
            ctx.lineWidth = 1;
        }
        if (v = elm.prop.dashArray) {
            ctx.setLineDash(v.split(",").map((x: string) => parseInt(x)));
        } else {
            ctx.setLineDash([]);
        }
        if (setOnly) return;
        if (elm.path) {
            ctx.stroke(elm.path);
        } else {
            ctx.stroke();
        }
    }
}
