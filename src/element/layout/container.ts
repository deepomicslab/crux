import { Component } from "../component";
import { ComponentOption } from "../component-options";

type Paddings = [number, number, number, number];

export interface ContainerOption extends ComponentOption {
    padding: number;
    "padding-x": number;
    "padding-y": number;
}

export class Container extends Component<ContainerOption> {
    public init() {
        this.addHook("didLayout", this._layoutSubTree.bind(this));
    }

    private _layoutSubTree() {
        const [pt, pr, pb, pl] = this._getPadding();

        this.children.forEach(c => c.$geometry.x += pl);
        this.children.forEach(c => c.$geometry.y += pt);

        const maxX = Math.max(...this.children.map(c => c.maxX));
        const maxY = Math.max(...this.children.map(c => c.maxY));

        this.$geometry.height = maxY + pb;
        this.$geometry.width = maxX + pr;
    }

    private _getPadding(): Paddings {
        const result = [0, 0, 0, 0] as Paddings;
        let p: number;
        if (p = this.prop.padding) {
            result.fill(p);
        }
        if (p = this.prop["padding-x"]) result[1] = result[3] = p;
        if (p = this.prop["padding-y"]) result[0] = result[2] = p;
        if (p = this.prop["padding-t"]) result[0] = p;
        if (p = this.prop["padding-r"]) result[1] = p;
        if (p = this.prop["padding-b"]) result[2] = p;
        if (p = this.prop["padding-l"]) result[3] = p;
        return result;
    }
}
