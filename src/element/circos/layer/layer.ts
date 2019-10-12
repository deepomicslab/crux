import { Component, ComponentOption } from "../../../element";
import { template } from "../../../template/tag";
import { CircosSection } from "../circos";

export interface CircosLayerOptions extends ComponentOption {
    section: CircosSection;
    thickness: number;
    outerGap: number;
}

export class CircosLayer extends Component<CircosLayerOptions> {
    public render = template`
    Component {
        @if prop.hasBackground {
            Arc {
                x1 = prop.section.startAngle
                x2 = prop.section.endAngle
                r1 = innerR
                r2 = outerR
                fill = "#fff"
                rad = true
            }
        }
        @yield content with this
    }
    `;

    public innerR = 100;
    public outerR = 200;

    public willRender() {
        if (!this.prop.section)
            throw new Error(`CircosLayer: a section object must be supplied.`);
        const { section, thickness, outerGap } = this.prop;
        [this.innerR, this.outerR] = this.prop.section.circos._updateLayerRadius(section, thickness, outerGap);
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            thickness: 50,
            outerGap: -1,
            hasBackground: true,
        };
    }
}
