import { labelGroup } from "../src/algo";
import { Component } from "../src/element/component";
import { ComponentOption } from "../src/element/component-options";
import { template } from "../src/template/tag";

import d3 = require("d3-scale");

interface ReconstructedOption extends ComponentOption {
    virus: any;
}

export class Reconstructed extends Component<ReconstructedOption> {
    public render = template`
    Rows {
        x = 40
        width = 100%-120
        Component {
            height = 300
            Component {
                y = 180
                height = 120
                clip = @clip(bound)
                Rect {
                    width = 100%; height = 100%
                    fill = "rgba(200,200,200,.2)"
                }
                Area {
                    height = 100%
                    data = prop.depth
                    xScale = @scale-linear(state.scaledL, state.scaledR)
                    yScale = @scale-linear(0, prop.depthMax)
                    fill = "#66ccff"
                }
                Line {
                    x1 = 0; x2 = 100%; y1 = 100%; y2 = 100%
                    stroke = "#000"
                }
            }
            Component {
                height = 100%
                xScale = @scale-linear(state.scaledL, state.scaledR)

                @let mutations = layoutMut(prop.mutations)
                @for mut in mutations {
                    Component {
                        style:visibility = mut._displayed ? "visible" : "hidden"
                        key = mut.pos
                        x = @scaled(mut.pos)
                        width = 0
                        height = 100%
                        Line {
                            x1 = 0; x2 = 0
                            y1 = 100%; y2 = 100%-120
                            stroke = "#000"
                        }
                        Line {
                            x1 = 0; x2 = mut._offsetX
                            y1 = 100%-120; y2 = 120
                            stroke = "#000"
                        }
                        Container {
                            x = mut._offsetX
                            y = 116
                            width = 0
                            anchor = @anchor(left, middle)
                            rotation = @rotate(-60deg)
                            padding-x = 4
                            padding-y = 2
                            Rect {
                                width = 100%; height = 100%
                                fill = "#aaa"
                                detached = true
                            }
                            Text {
                                x = 0
                                fontSize = 13
                                html = mutLabel(mut)
                            }
                        }
                    }
                }
            }
        }
        Container {
            width = 100%
            padding-y = 10
            Rect {
                width = 100%; height = 100%;
                fill = "rgba(200,200,200,.2)"
                detached = true
            }
            GeneArea {
                genes = prop.gene
            }
            Axis {
                y = 100%
                width = 100%
                detached = true
                orientation = "bottom"
                xScale = @scale-linear(state.scaledL, state.scaledR)
            }
        }
        Component {
            Component {
                y = 20
                height = 28
                clip = @clip(bound, 4, 4)
                Rect {
                    width = 100%; height = 100%
                    fill = "#eee"
                }
                Area {
                    height = 100%
                    data = prop.depth
                    xScale = @scale-linear(1, prop.virus.orig_len)
                    yScale = @scale-linear(0, prop.depthMax)
                    fill = "#aaa"
                }
            }
            Brush {
                y = 20
                height = 28
                cornerRadius = 4
                range = [1, prop.virus.orig_len]
                onBrushUpdate = updateRange.bind(this)
                onBrushEnd = updateRange.bind(this)
            }
        }
    }
    `;

    protected state = {
        scaledL: 0,
        scaledR: 1,
    };

    public didCreate() {
        this.state.scaledL = 1;
        this.state.scaledR = this.prop.virus.orig_len;
    }

    private layoutMut(mutations: any[]) {
        const width = this.$geometry.width - 120;
        const scale = d3.scaleLinear()
            .domain([this.state.scaledL, this.state.scaledR])
            .range([0, width]);

        return labelGroup(mutations)
            .minGap(18)
            .maxSize([0, width])
            .displayX((x: any) => scale(x.pos))
            .run();
    }

    private mutLabel(mut: any) {
        let s: string;
        switch (mut.type) {
            case "snp":
                s = `${mut.origAllele} ▸ ${mut.allele}`; break;
            case "ins":
                s = `+ ${mut.allele}`; break;
            case "del":
                s = `× ${mut.allele}`; break;
        }
        return `<tspan class="pos">${mut.pos}: </tspan><tspan class="desc ${mut.type}">${s}</tspan>`;
    }

    private updateRange(range: [number, number]) {
        this.setState({
            scaledL: range[0],
            scaledR: range[1],
        });
    }
}
