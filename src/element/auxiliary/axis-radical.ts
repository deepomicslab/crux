import { Anchor, GeometryOptValue } from "../../defs/geometry";
import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { getTicks } from "./axis";

export interface AxisRadicalOption extends ComponentOption {
    orientation?: "horizontal" | "vertical";
    tickCount?: number;
    tickInterval?: number;
    ticks?: number[];
    includeEndTicks?: boolean;
    roundEndTicks: boolean;
    showLabels?: boolean;
    labelAnchor?: Anchor;
    labelPosition?: GeometryOptValue;
}

export class AxisRadical extends Component<AxisRadicalOption> {
    public render = template`
    Component {
        @let labelPos = prop.labelPosition || 0
        @for (tick, index) in ticks {
            Component {
                key = index
                Circle.centered {
                    r = tick.pos
                    fill = "none"
                    stroke = "#aaa"
                    shapeRendering = "crispEdges"
                }
                @if prop.showLabels {
                    Text {
                        x = labelPos
                        y = tick.pos
                        text = tick.value
                        anchor = @anchor("m", "c")
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

    // @ts-ignore
    private get ticks(): any[] {
        return getTicks(
            this.getScale(false),
            this.prop.ticks,
            this.prop.tickInterval,
            this.prop.tickCount,
            this.prop.includeEndTicks,
            this.prop.roundEndTicks,
            false,
        );
    }
}
