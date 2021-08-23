// import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export type LegendType  = "Rect" | "Triangle" | "Circle" | "Line" | "Custom";

export interface LegendOption extends ComponentOption {
    type?: LegendType;
    title?: string;
    data: { type: LegendType, label: string, stroke?: string, fill?: string }[];
    lineHeight: number;
    legendWidth: number;
    padding: number;
}

export class Legend extends Component<LegendOption> {
    public render () {
        return this.t`
    Container {
        padding = prop.padding
        Rect.full {
            detached = true
            fill = "#fff"
            stroke = "#000"
            @props prop.opt.bg
        }
        Rows {
            x = 4
            @if prop.title {
                Container {
                    height = prop.lineHeight;
                    Text(prop.title);
                }
            }
            @for (data, index) in prop.data {
                Columns {
                    key = index
                    height = prop.lineHeight;
                    Component {
                        width = prop.legendWidth
                        height = 100%
                        @let t = data.type || prop.type
                        @if t === "Custom" {
                            @yield legend with data
                        }
                        @elsif t === "Line" {
                            Line {
                                x1 = 0; y = @geo(50, 1); x2 = 100%
                                stroke = data.stroke
                                strokeWidth = 2
                            }
                        } @else {
                            Component(t) {
                                x = 50%; y = @geo(50, 1); anchor = @anchor("m", "c")
                                width = 10; height = 10; r = 5
                                stroke = data.stroke; fill = data.fill
                            }
                        }
                    }
                    Container {
                        height = 100%
                        Text {
                            x = 4
                            y = 50%
                            anchor = @anchor("left", "middle")
                            text = data.label
                            @props prop.opt.label
                        }
                    }
                }
            }
        }
    }
    `; }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            lineHeight: 12,
            legendWidth: 20,
            data: [],
            type: "Rect",
            padding: 4,
        };
    }
}
