import { BaseElement } from "../element";
import { tooltip } from "../utils";
import { Behavior } from "./behavior";

export interface TooltipOption {
    content: string | [(...arg: any) => string, any];
}

export default class Tooltip extends Behavior {
    public events = ["mouseenter", "mouseleave"];

    private content: string | [(...arg: any) => string, any];

    constructor(public el: BaseElement, op: Partial<TooltipOption>) {
        super();
        if (op.content) {
            this.content = op.content;
        } else {
            throw new Error(`Tooltip: content must be provided.`);
        }
    }

    public mouseenter(ev: MouseEvent) {
        const content = typeof this.content === "string" ?
            this.content :
            this.content[0].apply(null, this.content.slice(1));
        tooltip.show(content, ev);
    }

    public mouseleave() {
        tooltip.hide();
    }

    public updateProps(op: Partial<TooltipOption>): void {
        if (op.content) this.content = op.content;
    }
}