import _ = require("lodash");

import { Anchor, GeometryValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { XYPlot } from "../plot";

export interface AxisOption extends ComponentOption {
    orientation: "top" | "bottom" | "left" | "right";
    tickCount: number;
    tickInterval: number;
    ticks: number[];
    includeEndTicks: boolean;
    stroke: string;
}

export class Axis extends Component<AxisOption> {
    public render = template`
    Component {
        width = isHorizontal ? prop.width : 0
        height = isHorizontal ? 0 : prop.height
        Line {
            x1 = 0; x2 = getX()
            y1 = 0; y2 = getY()
            stroke = prop.stroke
            shapeRendering = "crispEdges"
        }
        @let offset = isInner ? -4 : 4
        @let labelAnchor = getLabelAnchor
        @for (tick, index) in ticks {
            Component {
                key = index
                x = isHorizontal ? tick.pos : 0
                y = isHorizontal ? 0 : tick.pos
                Line {
                    x1 = 0
                    x2 = isHorizontal ? 0 : offset
                    y1 = 0
                    y2 = isHorizontal ? offset : 0
                    stroke = prop.stroke
                }
                @yield label with tick default {
                    Text {
                        text = tick.value
                        x = isHorizontal ? 0 : offset
                        y = isHorizontal ? offset : 0
                        anchor = labelAnchor
                        fontSize = 10
                        fill = prop.stroke
                        style:visibility = tick.show ? "visible" : "hidden"
                    }
                }
            }
        }
    }
    `;

    public defaultProp() {
        return {
            orientation: "top",
            tickCount: 5,
            includeEndTicks: true,
            stroke: "#000",
        };
    }

    public static propNameForInitializer() { return "orientation"; }

    private _tickValues?: any[];

    public willRender() {
        if (this.$parent instanceof XYPlot &&
            this.$parent.flipped !== this.isHorizontal) {
            const domain = this.$parent.categoryScale.domain();
            this._tickValues = this.$parent.discreteCategory ?
                domain : null; // _.range(domain[0], domain[1] + 1);
        }
    }

    private get isHorizontal() {
        return this.prop.orientation === "top" || this.prop.orientation === "bottom";
    }

    private get isInner() {
        return this.prop.orientation === "top" || this.prop.orientation === "left";
    }

    // @ts-ignore
    private getX(): any {
        return this.isHorizontal ? GeometryValue.fullSize : 0;
    }

    // @ts-ignore
    private getY(): any {
        return this.isHorizontal ? 0 : GeometryValue.fullSize;
    }

    // @ts-ignore
    private get getLabelAnchor() {
        return (this.isHorizontal ? Anchor.Center : this.isInner ? Anchor.Right : Anchor.Left) |
            (this.isHorizontal ? this.isInner ? Anchor.Bottom : Anchor.Top : Anchor.Middle);
    }

    // @ts-ignore
    private get ticks(): any[] {
        return getTicks(
            this.getScale(this.isHorizontal),
            this._tickValues || this.prop.ticks,
            this.prop.tickInterval,
            this.prop.tickCount,
            this.prop.includeEndTicks,
        );
    }
}

export type TickValue = { value: string, pos: number, show: boolean };

export function getTicks(
    scale: any, providedTicks: any,
    interval: number | undefined, count: number | undefined, includeEndTicks: boolean | undefined): TickValue[] {
    if (!scale) {
        throw new Error(`Axis: you must supply a scale.`);
    }

    const hasProvidedTicks = Array.isArray(providedTicks);
    let ticks: number[];
    if (hasProvidedTicks) {
        ticks = providedTicks;
    } else {
        ticks = [];
        const domain = scale.domain();
        let i: number;
        if (interval) {
            i = interval;
        } else {
            if (!count) {
                throw new Error(`Axis: "ticks", "tickInterval" or "tickCount" must be provided.`);
            }
            const rawInterval = (domain[1] - domain[0]) / count;
            const digits = baseDigitOf(rawInterval);
            i = _.minBy([0.1, 0.2, 0.5, 1, 2, 5].map(x => x * digits), x => {
                if (x > domain[1]) { return Number.MAX_SAFE_INTEGER; }
                return Math.abs(x - rawInterval);
            })!;
        }
        // check whether domain[0] can be divided by interval
        const start = Math.ceil(domain[0] / i) * i;
        let counter = start;
        while (counter < domain[1]) {
            ticks.push(pretty(counter));
            counter += i;
        }

        // add start and end ticks
        if (includeEndTicks) {
            ticks.unshift(domain[0].toFixed());
            ticks.push(domain[1].toFixed());
        }
    }

    const tickValues = ticks.map(t => ({
        value: t.toString(),
        pos: scale(t),
        show: true,
    }));

    if (includeEndTicks && !hasProvidedTicks) {
        // remove overlap
        const FACTOR = 3;
        if (Math.abs(tickValues[0].pos - tickValues[1].pos) <
            FACTOR * (tickValues[0].value.length + tickValues[1].value.length)) {
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

function pretty(n: number): number {
    return parseFloat(n.toPrecision(12));
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
