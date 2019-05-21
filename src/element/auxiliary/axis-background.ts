import { Anchor, GeometryOptValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { getTicks } from "./axis";

export interface AxisBackgroundOption extends ComponentOption {
    orientation: "horizontal" | "vertical";
    tickCount: number;
    tickInterval: number;
    ticks: number[];
    includeEndTicks: boolean;
    showLabels: boolean;
    labelAnchor: Anchor;
    labelPosition: GeometryOptValue;
}

export class AxisBackground extends Component<AxisBackgroundOption> {
    public render = template`
    Component {
        @let labelAnchor = prop.labelAnchor || getLabelAnchor()
        @let labelPos = prop.labelPosition || 0
        @for (tick, index) in ticks {
            Component {
                key = index
                x = isHorizontal ? tick.pos : 0
                y = isHorizontal ? 0 : tick.pos
                width = 100%
                height = 100%
                Line {
                    x1 = 0
                    x2 = isHorizontal ? 0 : @geo(100, 0)
                    y1 = 0
                    y2 = isHorizontal ? @geo(100, 0) : 0
                    stroke = "#aaa"
                    shapeRendering = "crispEdges"
                }
                @if prop.showLabels {
                    Text {
                        text = tick.value
                        x = isHorizontal ? 0 : labelPos
                        y = isHorizontal ? labelPos : 0
                        anchor = labelAnchor
                        fontSize = 10
                        style:visibility = tick.show ? "visible" : "hidden"
                    }
                }
            }
        }
    }
    `;

    public defaultProp() {
        return {
            orientation: "hotizontal",
            tickCount: 5,
            includeEndTicks: false,
        };
    }

    private getLabelAnchor() {
        return this.isHorizontal ? Anchor.Top | Anchor.Right : Anchor.Left | Anchor.Bottom;
    }

    private get isHorizontal() {
        // for axis background, "hotizontal lines" uses the vertical scale
        return this.prop.orientation === "vertical";
    }

    private get ticks(): any[] {
        return getTicks(
            this.getScale(this.isHorizontal),
            this.prop.ticks,
            this.prop.tickInterval,
            this.prop.tickCount,
            this.prop.includeEndTicks,
        );
    }
}
