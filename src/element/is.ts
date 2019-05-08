import { BaseElement } from "./base-element";
import { Component } from "./component";
import { PrimitiveElement } from "./primitive/primitive";

export function isRenderable(el: BaseElement): el is Component {
    return typeof (el as any).render === "function";
}

export function isPrimitive(el: BaseElement): boolean {
    return (el as PrimitiveElement).__primitive__;
}
