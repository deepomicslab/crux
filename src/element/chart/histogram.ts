import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { ChartPaddingOptions } from "./utils/option-padding";

export interface HistogramOption extends ComponentOption, ChartPaddingOptions {

}

export class Histogram extends Component<HistogramOption> {
    public render = template`
    Component {
        Component {
            @let p = _paddings
            x = p[3]
            y = p[0]
            width = @geo(100, -p[1]-p[3])
            height = @geo(100, -p[0]-p[2])
        }
    }
    `;

    public willRender() {
        // const p = this._paddings = getPaddings(this);
        // this._xSize = (this.$geometry.width - p[1] - p[3]) / this.prop.data[0].length;
        // this._ySize = (this.$geometry.height - p[0] - p[2]) / this.prop.data.length;
    }
}
