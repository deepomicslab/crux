import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export type LegendType  = "dot" | "rect" | "line" | "custom";

export interface LegendOption extends ComponentOption {
    type?: LegendType;
    title?: string;
    data: { type: LegendType, label: string, stroke?: string, fill?: string }[];
    lineHeight: number;
    legendWidth: number;
    padding: number;
}

export class Legend extends Component<LegendOption> {
    public render = template`
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
                        @if t === "rect" {
                            Rect {
                                x = 1; y = 1; width = 100%-2; height = 100%-2
                                stroke = data.stroke; fill = data.fill
                            }
                        }
                        @elsif t === "circle" {
                            Circle.centered {
                                x = 50%; y = 50%; r = 5
                                stroke = data.stroke; fill = data.fill
                            }
                        }
                        @elsif t === "line" {
                            Line {
                                x1 = 0; y1 = 50%; x2 = 100%; y2 = 50%
                                stroke = data.stroke
                                strokeWidth = 2
                            }
                        }
                        @else {
                            @yield legend with data
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
    `;

    public defaultProp() {
        return {
            ...super.defaultProp(),
            lineHeight: 12,
            legendWidth: 20,
            data: [],
            type: "rect",
            padding: 4,
        };
    }
}
