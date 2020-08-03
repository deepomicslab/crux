import * as d3 from "d3-chord";
import { Component, ComponentOption } from "../../element";
import { template } from "../../template/tag";
import { Circos } from "./circos";

export interface CircosChordOption extends ComponentOption {
    type: "band" | "single";
    fromSection: string;
    fromPos: [number, number];
    toSection: string;
    toPos: [number, number];
}

export abstract class CircosChord<Option extends CircosChordOption> extends Component<Option> {
    public render = template`
    Component {
        Path {
            d = ribbonPath()
            fill = "#aaa"
            @props prop.opt.chord
        }
    }
    `;

    public get circos(): Circos {
        return this.$parent as Circos;
    }

    // @ts-ignore
    private ribbonPath() {
        const sourceScale = this.circos.sectionById[this.prop.fromSection].scale;
        const targetScale = this.circos.sectionById[this.prop.toSection].scale;
        const from = this.prop.fromPos;
        const to = this.prop.toPos;
        const radius = this.circos.prop.innerR;

        return d3.ribbon()({
            source: {
                startAngle: sourceScale(from[0]),
                endAngle: sourceScale(from[1]),
                radius,
            },
            target: {
                startAngle: targetScale(to[0]),
                endAngle: targetScale(to[1]),
                radius,
            },
        });
    }
}
