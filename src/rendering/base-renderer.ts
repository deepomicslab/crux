import { BaseElement } from "../element/base-element";
import { BaseOption } from "../element/base-options";

export abstract class BaseRenderer {
    public abstract render(element: BaseElement<BaseOption>): void;
}

export type RenderFunc = (element: BaseElement<BaseOption>) => void;
