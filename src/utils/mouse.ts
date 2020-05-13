import { Component } from "../element";
import { BaseElement } from "../element/base-element";
import { CanvasMouseEvent } from "../rendering/canvas/canvas";
import { Matrix } from "./matrix";

export default function (el: BaseElement, event: MouseEvent | CanvasMouseEvent): [number, number] {
    if ("_m_x" in event) {
        const dpi = window.devicePixelRatio;
        const point = { x: event._m_x! / dpi, y: event._m_y! / dpi };
        const m = compose(el);
        transformPoint(point, m.inverse());
        return [point.x, point.y];
    }

    while (!el.vnode) {
        el = (el as Component).children[0];
    }
    const node = el.vnode!.elm! as SVGGraphicsElement;
    const svg: SVGSVGElement = node.ownerSVGElement || (node as any);

    if (svg.createSVGPoint) {
        let point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM()!.inverse());
        return [point.x, point.y];
    }

    const rect = node.getBoundingClientRect();
    return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
}

function compose(el: BaseElement): Matrix {
    if (!el) return new Matrix();
    let m = compose(el.parent);
    if ((el as Component).$_cachedTransform) {
        const [x, y, r] = (el as Component).$_cachedTransform!;
        if (x !== 0 || y !== 0) m = m.transform(Matrix.translate(x, y));
        if (r !== 0) m = m.transform(Matrix.rotate(r));
    }
    return m;
}

function transformPoint(point: { x: number; y: number }, m: Matrix) {
    const x = m.a * point.x + m.c * point.y + m.e;
    const y = m.b * point.x + m.d * point.y + m.f;
    point.x = x;
    point.y = y;
}
