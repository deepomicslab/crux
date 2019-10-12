import { template } from "../../../template/tag";
import { CircosContent, CircosContentOption } from "./content";

export interface CircosContentTicksOption extends CircosContentOption {
    interval: number;
    hasLabel: boolean;
    isOuter: boolean;
}

export class CircosContentTicks extends CircosContent<CircosContentTicksOption> {
    public render = template`
    Component {
        @let isOuter = prop.isOuter
        @let innerR = isOuter ? layer.outerR : layer.innerR
        @for (tick, i) in ticks {
            RadicalLine.rad {
                key = i
                x = tick.pos
                r1 = innerR
                r2 = innerR + (isOuter ? -5 : 5)
                @props prop.opt.tick
            }
            @if prop.hasLabel {
                @let x = tick.pos
                @let y = innerR + (isOuter ? -7 : 7)
                Text {
                    key = i
                    text = tick.text
                    x = x
                    y = y
                    anchor = circos.labelAnchor(x, isOuter)
                    rotation = circos.labelRotation(x, y);
                    fontSize = 9
                    @props prop.opt.label
                }
            }
        }
    }
    `;

    // @ts-ignore
    private ticks: { value: number, pos: number, text: string }[];

    public willRender() {
        const s = this.getScale(true);
        const [start, end] = s.domain();
        this.ticks = [];
        let t = start;
        const interval = this.prop.interval;
        while (t < end) {
            this.ticks.push({
                value: t,
                pos: s(t),
                text: filesize(t),
            });
            t += interval;
        }
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            interval: 50000000,
            hasLabel: true,
        };
    }
}

function filesize(value: number) {
    if (value >= 1000000) {
        return `${pretty(value / 1000000)}M`;
    } else if (value >= 1000) {
        return `${pretty(value / 1000)}K`;
    } else {
        return `${pretty(value)}bp`;
    }
}

function pretty(value: number) {
    return value.toFixed(2).replace(/0+$/, "");
}
