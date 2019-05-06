import { Component } from "../component";
import { ComponentOption } from "../component-options";

export class Rows extends Component {
    public init() {
        this.addHook("didLayout", this._layoutSubTree.bind(this));
    }

    private _layoutSubTree() {
        let counter = 0;
        for (const child of this.children) {
            if (child instanceof Component) {
                const $g = (child as Component<ComponentOption>).$geometry;
                $g.y = counter;
                counter += $g.height;
            } else {
                throw Error(`Rows can only contain Components as direct child`);
            }
        }
        this.$geometry.height = counter;
    }
}
