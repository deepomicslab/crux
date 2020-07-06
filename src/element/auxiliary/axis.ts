import * as _ from "lodash";

import { Anchor, GeometryValue } from "../../defs/geometry";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { XYPlot } from "../plot";
import { scaled, scaleDomain } from "../scale";

export interface AxisOption extends ComponentOption {
    orientation: "top" | "bottom" | "left" | "right";
    tickCount: number;
    tickInterval: number;
    tickFormat: (d: any) => string;
    ticks: number[];
    includeEndTicks: boolean;
    roundEndTicks: boolean;
    color: string;
}

@useTemplate(`
Component {
    width = isHorizontal ? prop.width : 0
    height = isHorizontal ? 0 : prop.height
    Line {
        x1 = 0; x2 = getX()
        y1 = 0; y2 = getY()
        shapeRendering = "crispEdges"
        stroke = prop.color
        @props prop.opt.line
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
                stroke = prop.color
                @props prop.opt.tick
            }
            @yield label with tick default {
                Text {
                    text = prop.tickFormat(tick.value)
                    x = isHorizontal ? 0 : offset
                    y = isHorizontal ? offset : 0
                    anchor = labelAnchor
                    fontSize = 10
                    visible = tick.show
                    fill = prop.color
                    @props prop.opt.label
                }
            }
        }
    }
}
`)
export class Axis extends Component<AxisOption> {
    public defaultProp() {
        return {
            orientation: "bottom",
            tickCount: 5,
            tickFormat: (d: TickValue) => d.toString(),
            includeEndTicks: true,
            roundEndTicks: false,
            stroke: "#000",
        };
    }

    public static propNameForInitializer() {
        return "orientation";
    }

    private _tickValues?: any[];

    public willRender() {
        if (this.$parent instanceof XYPlot && this.$parent.flipped !== this.isHorizontal) {
            const domain = this.$parent.categories;
            this._tickValues = this.$parent.discreteCategory ? domain : undefined; // _.range(domain[0], domain[1] + 1);
        }
        if (this._firstRender) {
            if (this.prop.orientation === "top" || this.prop.orientation === "bottom") {
                this.isInXScaleSystem = true;
            } else {
                this.isInYScaleSystem = true;
            }
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
        return (
            (this.isHorizontal ? Anchor.Center : this.isInner ? Anchor.Right : Anchor.Left) |
            (this.isHorizontal ? (this.isInner ? Anchor.Bottom : Anchor.Top) : Anchor.Middle)
        );
    }

    // @ts-ignore
    private get ticks(): TickValue[] {
        const ticks = getTicks(
            this.getScale(this.isHorizontal),
            this._tickValues || this.prop.ticks,
            this.prop.tickInterval,
            this.prop.tickCount,
            this.prop.includeEndTicks,
            this.prop.roundEndTicks,
            this.isHorizontal,
        );
        if (this.prop.includeEndTicks && !(this._tickValues || this.prop.ticks) && this.isHorizontal) {
            const tf = this.prop.tickFormat;
            if (isOverlap(ticks[0], ticks[1], tf)) {
                ticks[1].show = false;
            }
            const last = ticks.length - 1;
            if (isOverlap(ticks[last], ticks[last - 1], tf)) {
                ticks[last - 1].show = false;
            }
        }
        return ticks;
    }
}

export type TickValue = { value: number; pos: number; show: boolean };

export function getTicks(
    scale: any,
    providedTicks: any,
    interval: number | undefined,
    count: number | undefined,
    includeEndTicks: boolean | undefined,
    roundEndTicks: boolean | undefined,
    isHorizontal: boolean,
): TickValue[] {
    if (!scale) {
        throw new Error(`Axis: you must supply a scale.`);
    }

    const hasProvidedTicks = Array.isArray(providedTicks);
    let ticks: number[];
    if (hasProvidedTicks) {
        ticks = providedTicks;
    } else {
        ticks = [];
        const domain = scaleDomain(scale);
        const isNumeric = domain.length === 2 && typeof domain[0] === "number";
        if (isNumeric) {
            let i: number;
            const isInversed = domain[1] < domain[0];
            if (interval) {
                i = isInversed ? -interval : interval;
            } else {
                if (!count) {
                    throw new Error(`Axis: "ticks", "tickInterval" or "tickCount" must be provided.`);
                }
                const rawInterval = (domain[1] - domain[0]) / count;
                const absInterval = Math.abs(rawInterval);
                const digits = baseDigitOf(absInterval);
                i = _.minBy(
                    [0.1, 0.2, 0.5, 1, 2, 5].map(x => x * digits),
                    x => {
                        if (!isInversed && x > domain[1]) {
                            return Number.MAX_SAFE_INTEGER;
                        }
                        return Math.abs(x - absInterval);
                    },
                )!;
                if (isInversed) i = -i;
            }
            // check whether domain[0] can be divided by interval
            const start = Math.ceil(domain[0] / i) * i;
            let counter = start;
            while ((isInversed ? counter - domain[1] : domain[1] - counter) > 1e-15) {
                ticks.push(pretty(counter));
                counter += i;
            }

            // add start and end ticks
            if (includeEndTicks && isNumeric) {
                ticks.unshift(roundEndTicks ? Math.round(domain[0]) : domain[0]);
                ticks.push(roundEndTicks ? Math.round(domain[1]) : domain[1]);
            }
        } else {
            ticks = domain;
        }
    }

    const tickValues = ticks.map(t => ({
        value: t,
        pos: scaled(scale, t),
        show: true,
    }));

    return tickValues;
}

function isOverlap(a: TickValue, b: TickValue, tf: any) {
    const aLabel = tf ? tf(a.value) : a.value;
    const bLabel = tf ? tf(b.value) : b.value;
    const FACTOR = 3;
    return Math.abs(a.pos - b.pos) < FACTOR * (aLabel.length + bLabel.length);
}

function pretty(n: number): number {
    return parseFloat(n.toPrecision(12));
}

function baseDigitOf(n: number): number {
    if (n === 0) return 0;
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
