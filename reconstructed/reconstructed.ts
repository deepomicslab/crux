import { labelGroup } from "../src/algo";
import { GeometryUnit, GeometryValue } from "../src/defs/geometry";
import { Component } from "../src/element/component";
import { ComponentOption } from "../src/element/component-options";
import { registerGlobalComponent } from "../src/element/global";
import { template } from "../src/template/tag";

import d3 = require("d3-scale");

interface ReconstructedOption extends ComponentOption {
    virus: any;
    depth: any;
}

export class Reconstructed extends Component<ReconstructedOption> {
    public render = template`
    Rows {
        x = 40
        width = 100%-120
        Component {
            height = 300
            Component {
                ref = "depth"
                y = 180
                height = 120
                xScale = @scale-linear(state.scaledL, state.scaledR)
                yScale = @scale-linear(0, prop.depthMax)

                on:mouseenter = depthAreaMouseMove
                on:mousemove = depthAreaMouseMove
                on:mouseleave = this.setState({ mousePos: -1 })

                Rect {
                    width = 100%; height = 100%
                    fill = "rgba(200,200,200,.2)"
                }
                Component {
                    height = 100%
                    clip = @clip(bound)
                    Area {
                        height = 100%
                        data = prop.depth
                        fill = "#66ccff"
                    }
                }
                @if state.mousePos >= 0 {
                    Component {
                        height = 100%
                        x = @scaled(state.mousePos)
                        style:pointer-events = "none"

                        @let depth = prop.depth[state.mousePos]

                        Line {
                            x1 = 0; x2 = 0
                            y1 = @geo(100, -@scaled-y(depth))
                            y2 = 100%
                            stroke = "#000"
                            dashArray = "4,4"
                        }
                        Text {
                            fill = "#000"
                            y = @geo(100, -@scaled-y(depth))
                            anchor = @anchor(bottom, center)
                            text = depth
                        }
                    }
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
                    MutPoint {
                        mut = mut
                        key = mut.pos
                    }
                }
            }
        }
        Container {
            ref = "geneAreaContainer"
            width = 100%
            padding-y = 10
            xScale = @scale-linear(state.scaledL, state.scaledR)

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
        mousePos: 1000,
    };

    public didCreate() {
        this.state.scaledL = 1;
        this.state.scaledR = this.prop.virus.orig_len;
    }

    private depthAreaMouseMove(e) {
        const x = e.clientX - e.target.getBoundingClientRect().left;
        const scale = (this.$ref.depth as Component).getScale(true);
        this.setState({ mousePos: scale.invert(x).toFixed() });
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

    private updateRange(range: [number, number]) {
        this.setState({
            scaledL: range[0],
            scaledR: range[1],
        });
    }
}

class MutPoint extends Component {
    public render = template`
        Component {
            @let mut = prop.mut

            x = @scaled(mut.pos)
            width = 0
            height = 100%
            style:cursor = "pointer"
            style:visibility = mut._displayed ? "visible" : "hidden"

            on:mouseenter = mouseover(true)
            on:mouseleave = mouseover(false)

            @if state.active {
                Line {
                    x1 = 0; x2 = 0
                    y1 = 100%
                    y2 = lineBottom
                    stroke = "#000"
                    dashArray = "4,4"
                }
            }
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
                    fill = state.active ? "#000" : "rgba(0,0,0,0)"
                    cornerRadius = 3
                    detached = true
                }
                Text {
                    x = 0
                    fontSize = 13
                    fill = state.active ? "#fff" : "#000"
                    html = mutLabel(mut)
                }
            }
        }
    `;

    public state = {
        active: false,
    };

    private mouseover(active: boolean) {
        this.setState({ active });
    }

    private get lineBottom() {
        const h = (this.$parent.$ref.geneAreaContainer as Component).$geometry.height;
        return GeometryValue.create(100, GeometryUnit.Percent, h);
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
}

registerGlobalComponent({ MutPoint });