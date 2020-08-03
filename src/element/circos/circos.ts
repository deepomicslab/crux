import { Anchor } from "../../defs/geometry";
import { Component, ComponentOption } from "../../element";
import { template } from "../../template/tag";
import { toCartesian } from "../../utils/math";

import * as d3 from "d3-shape";

interface CircosSectionDef {
    id: string;
    start: number;
    end: number;
    scale: number;
    data: any;
}

export interface CircosOption extends ComponentOption {
    sections: CircosSectionDef[];
    startAngle: number;
    endAngle: number;
    padAngle: number;
    layerPadding: number;
    innerR: number;
}

export type CircosSection = d3.PieArcDatum<CircosSectionDef> & {
    id: string;
    circos: Circos;
    scale: any;
};

export class Circos extends Component<CircosOption> {
    public render = template`
    Component {
        Component {
            height = 100%
            coord = "polar"
            coordUseRad = true
            @for section in sections {
                Component {
                    key = section.id
                    xScale = section.scale
                    @yield layers with section
                }
            }
            Component.lazy {
                @for section in sections {
                    @let x = ((section.startAngle + section.endAngle) / 2)
                    @let y = sectionRadius[section.id] + 5
                    Text {
                        key = section.id
                        text = section.id
                        x = x
                        y = y
                        anchor = section.circos.labelAnchor(x)
                        rotation = section.circos.labelRotation(x, y);
                        @props prop.opt.sectionLabel
                    }
                }
            }
            Component {
                @yield chords
            }
        }
    }
    `;

    public sections!: CircosSection[];
    public sectionById: Record<string, CircosSection> = {};
    private sectionRadius: Record<string, number> = {};

    public willRender() {
        const pie = d3
            .pie<CircosSectionDef>()
            .padAngle(this.prop.padAngle)
            .startAngle(this.prop.startAngle)
            .endAngle(this.prop.endAngle)
            .sortValues(null)
            .value(d => (d.scale || 1) * (d.end - d.start));

        this.sections = pie(this.prop.sections).map(s => ({
            ...s,
            id: s.data.id,
            startAngle: s.startAngle + s.padAngle,
            endAngle: s.endAngle - s.padAngle,
            circos: this,
            scale: this._createScale("linear", true, [s.data.start, s.data.end], [s.startAngle, s.endAngle]),
        }));

        this.sectionById = {};
        for (const s of this.sections) {
            this.sectionRadius[s.id] = this.prop.innerR;
            this.sectionById[s.id] = s;
        }
    }

    public _updateLayerRadius(section: CircosSection, thickness: number, gap: number = -1) {
        const i = this.sectionRadius[section.id];
        const o = i + thickness;
        this.sectionRadius[section.id] = o + (gap < 0 ? this.prop.layerPadding : gap);
        return [i, o];
    }

    public get rotation() {
        return 0;
    }

    public labelRotation(rx: number, ry: number): [number, number, number] {
        const [x, y] = toCartesian(rx, ry, true);
        const angle = (rx * 180) / Math.PI;
        let adjustedAngle = ((rx + this.rotation) * 180) / Math.PI;
        if (adjustedAngle >= 360) {
            adjustedAngle -= 360;
        }
        if (adjustedAngle < 0) {
            adjustedAngle += 360;
        }
        return [adjustedAngle < 180 ? angle - 90 : angle + 90, x, y];
    }

    public labelAnchor(angle: number, towardsCenter: boolean = false): Anchor {
        let adjustedAngle = ((angle + this.rotation) * 180) / Math.PI;
        if (adjustedAngle >= 360) {
            adjustedAngle -= 360;
        }
        if (adjustedAngle < 0) {
            adjustedAngle += 360;
        }
        return (adjustedAngle > 180 === towardsCenter ? Anchor.Left : Anchor.Right) | Anchor.Middle;
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            startAngle: 0,
            endAngle: 2 * Math.PI,
            padAngle: 0.0075,
            layerPadding: 2,
            innerR: 100,
        };
    }
}
