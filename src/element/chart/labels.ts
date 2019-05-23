import { Anchor } from "../../defs/geometry";
import { template } from "../../template/tag";
import { getGetter } from "../plot";
import { BaseChart, BaseChartOption } from "./base-chart";

export interface LabelsOption extends BaseChartOption {
    labelGetter?: string | ((d: any) => string);
}

export class Labels extends BaseChart<LabelsOption> {
    protected data: any[];

    public render = template`
    Component {
        xScale = getScale(true) || createXScale()
        yScale = getScale(false) || createYScale()

        @let labelFunc = getLabelFunc()
        @for (d, index) in data {
            Text {
                @let x = getX(d)
                @let y = getY(d)
                key = index
                anchor = getAnchor()
                x = flipped ? y : x
                y = flipped ? x : y
                text = labelFunc(d, index, data)
            }
        }
    }
    `;

    private getAnchor() {
        return this.flipped ?
            (this.inverted ? Anchor.Left : Anchor.Right) | Anchor.Middle :
            (this.inverted ? Anchor.Top : Anchor.Bottom) | Anchor.Center;
    }

    private getX(d: any) {
        return this._scale(d.pos, !this.flipped);
    }

    private getY(d: any) {
        return this._scale(d.value, this.flipped);
    }

    private getLabelFunc() {
        return getGetter(this.prop.labelGetter) || (d => d.data.label || d.value);
    }
}
