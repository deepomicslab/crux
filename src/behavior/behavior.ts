import { BaseElement } from "../element";

export abstract class Behavior<Option = any> {
    public el: BaseElement;

    constructor(el: BaseElement, op: Option) {
        this.el = el;
        if (typeof op !== "object")
            throw new Error(`Behavior: the option must be an object, not ${op}`);
        if (this.init)
            this.init(op);
    }

    public init?(op: Option): void;
    public abstract events: string[];
    public abstract updateProps(op: any): void;
}
