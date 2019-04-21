import { BaseElement } from "../base-element";
import { Component } from "../component";

export function isRenderable(el: BaseElement): el is Component {
    return typeof (el as any).render === "function";
}
