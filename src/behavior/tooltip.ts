import { tooltip } from "../utils";
import { Behavior } from "./behavior";

export interface TooltipOption {
    content: string | [(...arg: any) => string, any];
    xOffset: number;
    yOffset: number;
    xAnchor: "left" | "right";
    yAnchor: "top" | "bottom";
}

export default class Tooltip extends Behavior<TooltipOption> {
    public events = ["mouseenter", "mouseleave"];

    private content!: string | [(...arg: any) => string, any];
    private op!: Partial<TooltipOption>;

    public init(op: Partial<TooltipOption>) {
        this.op = op;
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
        this.updateConfig();
        tooltip.show(content, ev);
    }

    public mouseleave() {
        tooltip.hide();
    }

    public updateProps(op: Partial<TooltipOption>): void {
        this.op = { ...this.op, ...op };
        if (op.content) this.content = op.content;

    }

    public updateConfig() {
        if (this.op.xOffset) {
            tooltip.config({ xOffset: this.op.xOffset });
        }
        if (this.op.yOffset) {
            tooltip.config({ yOffset: this.op.yOffset });
        }
        if (this.op.xAnchor) {
            tooltip.config({ xAnchor: this.op.xAnchor });
        }
        if (this.op.yAnchor) {
            tooltip.config({ yAnchor: this.op.yAnchor });
        }
    }
}
