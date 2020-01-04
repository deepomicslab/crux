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

    public init(op: Partial<TooltipOption>) {
        if (op.content) {
            this.content = op.content;
        } else {
            throw new Error(`Tooltip: content must be provided.`);
        }
        if (op.xOffset) {
            tooltip.config({ xOffset: op.xOffset });
        }
        if (op.yOffset) {
            tooltip.config({ yOffset: op.yOffset });
        }
        if (op.xAnchor) {
            tooltip.config({ xAnchor: op.xAnchor });
        }
        if (op.yAnchor) {
            tooltip.config({ yAnchor: op.yAnchor });
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
