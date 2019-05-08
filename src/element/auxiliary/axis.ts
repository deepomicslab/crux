import _ = require("lodash");

import { GeometryValue, Anchor } from "../../defs/geometry";
import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface AxisOption extends ComponentOption {
    orientation: "top" | "bottom" | "left" | "right";
    tickCount: number;
    tickInterval: number;
    ticks: number[];
    includeEndTicks: boolean;
}

export class Axis extends Component<AxisOption> {
    public defaultProp() {
        return {
            orientation: "top",
            tickCount: 5,
            includeEndTicks: true,
        };
    }

    public render = template`
    Component {
        x = prop.x
        y = prop.y
        width = isHorizontal ? prop.width : 0
        height = isHorizontal ? 0 : prop.height
        Line {
            x1 = 0; x2 = getX
            y1 = 0; y2 = getY
            stroke = "#000"
            shapeRendering = "crispEdges"
        }
        @let offset = isInner ? -4 : 4
        @let labelAnchor = getLabelAnchor
        @for (tick, index) in ticks {
            Component {
                key = index
                x = tick.pos
                Line {
                    x1 = 0; x2 = 0
                    y1 = 0; y2 = offset
                    stroke = "#000"
                }
                Text {
                    text = tick.value
                    y = offset
                    anchor = labelAnchor
                    fontSize = 10
                    style:visibility = tick.show ? "visible" : "hidden"
                }
            }
        }
    }
    `;

    private get isHorizontal() {
        return this.prop.orientation === "top" || this.prop.orientation === "bottom";
    }

    private get isInner() {
        return this.prop.orientation === "top" || this.prop.orientation === "left";
    }

    private get getX(): any {
        return this.isHorizontal ? GeometryValue.fullSize : 0;
    }

    private get getY(): any {
        return this.isHorizontal ? 0 : GeometryValue.fullSize;
    }

    private get getLabelAnchor() {
        return (this.isHorizontal ? Anchor.Center : this.isInner ? Anchor.Right : Anchor.Left) |
            (this.isHorizontal ? this.isInner ? Anchor.Bottom : Anchor.Top : Anchor.Middle);
    }

    private get ticks(): any[] {
        const scale = this.getScale(this.isHorizontal);
        if (!scale) {
            throw new Error(`Axis: you must supply a scale.`);
        }

        const ticks = [];
        const domain = scale.domain();
        let interval: number;
        if (this.prop.tickInterval) {
            interval = this.prop.tickInterval;
        } else {
            const rawInterval = (domain[1] - domain[0]) / this.prop.tickCount;
            const digits = baseDigitOf(rawInterval);
            interval = _.minBy([0.1, 0.2, 0.5, 1, 2, 5].map(x => x * digits), x => {
                if (x > domain[1]) { return Number.MAX_SAFE_INTEGER; }
                return Math.abs(x - rawInterval);
            });
        }
        // check whether domain[0] can be divided by interval
        const start = Math.ceil(domain[0] / interval) * interval;
        let counter = start;
        while (counter < domain[1]) {
            ticks.push(counter);
            counter += interval;
        }

        // add start and end ticks
        if (this.prop.includeEndTicks) {
            ticks.unshift(domain[0].toFixed());
            ticks.push(domain[1].toFixed());
        }

        const tickValues = ticks.map(t => ({
            value: t.toString(),
            pos: scale(t),
            show: true,
        }));

        if (this.prop.includeEndTicks) {
            // remove overlap
            const FACTOR = 3;
            if (Math.abs(tickValues[0].pos - tickValues[1].pos) <
                3 * (tickValues[0].value.length + tickValues[1].value.length)) {
                tickValues[1].show = false;
            }
            const last = ticks.length - 1;
            if (Math.abs(tickValues[last].pos - tickValues[last - 1].pos) <
                3 * (tickValues[last].value.length + tickValues[last - 1].value.length)) {
                tickValues[last - 1].show = false;
            }
        }

        return tickValues;
    }
}

function baseDigitOf(n: number): number {
    let count = 1;
    if (n > 1) {
        while (n / 10 >= 1) {
            n /= 10;
            count *= 10;
        }
    } else {
        while (n * 10 <= 1) {
            n *= 10;
            count /= 10;
        }
    }
    return count;
}
