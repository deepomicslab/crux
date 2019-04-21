import { BaseElement } from "../element/base-element";

export abstract class BaseRenderer {
    public abstract render(element: BaseElement<any>): void;
}
