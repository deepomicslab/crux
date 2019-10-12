import { template } from "../../../template/tag";
import { CircosContent, CircosContentOption } from "./content";

export interface CircosContentTextOption extends CircosContentOption {
    data: any[];
    text: string;
    radical: boolean;
}

export class CircosContentText extends CircosContent<CircosContentTextOption> {
    public render = template`
    Component {
        Text.centered {
            x = midX
            y = midY
            text = prop.text
            rotation = prop.radical ? circos.labelRotation(midX, midY) : null
            @props prop.opt.text
        }
    }
    `;

    // @ts-ignore
    private midX: number;
    // @ts-ignore
    private midY: number;

    public willRender() {
        this.midY = (this.layer.innerR + this.layer.outerR) / 2;
        this.midX = (this.section.startAngle + this.section.endAngle) / 2;
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            text: "",
        };
    }
}
