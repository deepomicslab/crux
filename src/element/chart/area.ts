import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface AreaOption extends ComponentOption {
    data: any[];
}

export class Area extends Component<AreaOption> {
    public render = template`
    Component {
        Path {
            d = getPath()
            fill = prop.fill
            stroke = prop.stroke
        }
    }
    `;

    private getPath(): string {
        const maxY = this.$geometry.height;
        const data = this.prop.data.map((d, i) => [
            this._scale(i, true),
            this._scale(d, false),
        ] as [number, number]);
        let path = `M${data[0][0]},${maxY} `;
        let d: [number, number];
        for (d of data) {
            path += `L${d[0]},${maxY - d[1]} `;
        }
        path += `L${d[0]},${maxY} z`;
        return path;
    }
}
