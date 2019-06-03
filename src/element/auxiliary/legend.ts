import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export type LegendType  = "dot" | "rect" | "line" | "custom";

export interface LegendOption extends ComponentOption {
    type?: LegendType;
    data: { type: LegendType, label: string, stroke?: string, fill?: string }[];
    lineHeight: number;
    legendWidth: number;
}

export class Legend extends Component<LegendOption> {
    public render = template`
    Container {
        padding = 4
        Rect.full {
            detached = true
            fill = "#fff"
            stroke = "#000"
        }
        Rows {
            x = 4
            width = 100%-8
            @for (data, index) in prop.data {
                Component {
                    key = index
                    width = 100%
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
                    Text {
                        x = prop.legendWidth + 4
                        y = 50%
                        anchor = @anchor(left, middle)
                        text = data.label
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
        };
    }
}
