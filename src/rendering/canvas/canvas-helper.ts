import * as d3c from "d3-color";

import { GeometryValue } from "../../defs/geometry";
import { BaseElement, Component, ComponentOption } from "../../element";
import { BaseElementOption } from "../../element/primitive/base-elm-options";
import { toRad } from "../../utils/math";

export function canvasClip(ctx: CanvasRenderingContext2D, elm: Component<ComponentOption>) {
    const width = elm.$geometry.width;
    const height = elm.$geometry.height;
    let v: any;
    if ((v = elm.prop.clip)) {
        if (v.type === "bound") {
            ctx.beginPath();
            ctx.rect(0, 0, width, height);
            ctx.clip();
        } else if (v.type === "polygon") {
            const points: number[] = v.points.map((p: GeometryValue | number, i: number) =>
                typeof p === "object" ? GeometryValue.cal(p, i % 2 ? height : width) : p,
            );
            ctx.beginPath();
            ctx.moveTo(points[0], points[1]);
            for (let i = 2; i < points.length; i += 2) {
                ctx.lineTo(points[i], points[i + 1]);
            }
            ctx.closePath();
            ctx.clip();
        } else {
            throw new Error(`Clip: unknown type "${v.type}"`);
        }
    }
}

export function canvasRotate(ctx: CanvasRenderingContext2D, elm: BaseElement<BaseElementOption>) {
    let v;
    if ((v = elm.prop.rotation)) {
        const v1 = v[1] === "_" ? elm.$geometry.x : v[1];
        const v2 = v[2] === "_" ? elm.$geometry.y : v[2];
        if (v[0] !== 0) {
            if (v1 === 0 && v2 === 0) {
                ctx.rotate(toRad(v[0]));
            } else {
                ctx.translate(v1, v2);
                ctx.rotate(toRad(v[0]));
                ctx.translate(-v1, -v2);
            }
        }
    }
}

export function canvasFill(
    ctx: CanvasRenderingContext2D,
    elm: BaseElement<BaseElementOption>,
    setOnly: boolean = false,
) {
    let f, v: any;
    if ((f = elm.prop.fill) && f !== "none") {
        if ((v = elm.prop.fillOpacity) && v < 1) {
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

export function canvasStroke(
    ctx: CanvasRenderingContext2D,
    elm: BaseElement<BaseElementOption>,
    setOnly: boolean = false,
) {
    let f, v: any;
    if ((f = elm.prop.stroke) && f !== "none") {
        if ((v = elm.prop.strokeOpacity)) {
            const color = d3c.color(f)!.rgb();
            ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.opacity * v})`;
        } else {
            ctx.strokeStyle = f;
        }
        if ((v = elm.prop.strokeWidth)) {
            ctx.lineWidth = v;
        } else {
            ctx.lineWidth = 1;
        }
        if ((v = elm.prop.dashArray)) {
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
