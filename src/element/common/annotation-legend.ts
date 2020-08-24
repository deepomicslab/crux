import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { AnnotationColor } from "./annotation-color";

interface AnnotationLegendOption extends ComponentOption {
    schemes: AnnotationColor[];
    backgroundColor: string;
    rectHeight: number;
    startX: number;
    startY: number;
    height: number;
}

@useTemplate(`
Component {
    height = 100%
    x = prop.startX
    y = prop.startY
    @let schemes = prop.schemes
    @for index in schemes.length {
        @let row = schemes[index]
        Component {
            @if row {
                @let colorScheme = row.colorScheme
                @if colorScheme.keys && !colorScheme.share {
                    @for i in colorScheme.keys.length {
                        @let key = colorScheme.keys[i];
                        Component {
                            @let pos = calculatePadding(index, key)
                            x = pos.x
                            y = pos.y
                            @if key.indexOf("cont_") > -1 {
                                Text {
                                    text = key;
                                }
                                @let min = colorScheme.colors[key].min
                                @let max = colorScheme.colors[key].max
                                @let num = colorScheme.colors[key].value.length
                                @let maxWidth = 200 / num
                                @for k in num {
                                    @let value = min + (max - min) / num * k
                                    Rect {
                                        key = "heat-desc-" + key + k
                                        x = maxWidth*k
                                        width = maxWidth
                                        height = prop.rectHeight
                                        fill = row.get(key, value)
                                        y = 20
                                    }
                                }
                                Axis {
                                    xScale = @scale-linear(min, max, 0, 200)
                                    orientation = "bottom"
                                    includeEndTicks = false
                                    y = prop.rectHeight + 20
                                    width = 200
                                }
                            } @else {
                                Component {
                                    Text {
                                        text = key;
                                    }
                                    @let keys = Object.keys(colorScheme.share ? colorScheme.share.colors : colorScheme.colors[key].colors)
                                    @for j in keys.length {
                                        Rect {
                                            key = "heat-desc-" + key + j
                                            width = prop.rectHeight
                                            height = prop.rectHeight
                                            fill = row.get(key, keys[j])
                                            y = (prop.rectHeight + 5) * (j+1) + 10
                                        }
                                        Text {
                                            text = keys[j]
                                            y = (prop.rectHeight + 5) * (j+1) + 10
                                            x = prop.rectHeight + 5
                                        }
                                    }
                                }
                            }
                        }
                    }
                } @else {
                    Component {
                        key = index
                        Text {
                            text = "Annotation";
                        }
                        @let pos = calculatePadding(index)
                        x = pos.x
                        y = pos.y
                        @let keys = Object.keys(colorScheme.share ? colorScheme.share.colors : colorScheme.colors)
                        @for j in keys.length {
                            Component {
                                key = index + j + keys
                                Rect {
                                    width = prop.rectHeight
                                    height = prop.rectHeight
                                    fill = row.get("", keys[j])
                                    y = (prop.rectHeight + 5) * (j+1) + 10
                                }
                                Text {
                                    text = keys[j]
                                    y = (prop.rectHeight + 5) * (j+1) + 10
                                    x = prop.rectHeight + 5
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}`)
export class AnnotationLegend extends Component<AnnotationLegendOption> {
    // @ts-ignore
    private calculatePadding(schemeIndex: number, key?: string) {
        let x = 0,
            y = 0;
        if (schemeIndex === 0 && !key) return { x, y };

        for (let i = 0; i < this.prop.schemes.length; i++) {
            const scheme = this.prop.schemes[i];
            if (scheme) {
                if (!scheme.colorScheme.keys) {
                    if (schemeIndex !== i) {
                        scheme.colorScheme.value!.forEach(
                            (row: string | number, index: number) => {
                                if (row === key) return;
                                else {
                                    y += this.prop.rectHeight + 5;
                                }
                            },
                        );
                        y += 50;
                    }
                } else {
                    for (const [k, value] of Object.entries(
                        scheme.colorScheme.colors,
                    )) {
                        if (k !== key) {
                            if (k.indexOf("cont_") > -1) {
                                y += 100;
                            } else {
                                y += (this.prop.rectHeight + 5) * Object.keys(value.colors).length + 50;
                            }
                            if (y > this.prop.height) {
                                y = 0;
                                x += 250;
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
            if (schemeIndex === i) break;
        }

        return { x, y };
    }

    public defaultProp() {
        return {
            rectHeight: 10,
            backgroundColor: "#fff",
            startX: 1400,
            startY: 0,
            height: 800,
        };
    }
}
