import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { isRenderable } from "../is";

export class Rows extends Component {
    public didLayoutSubTree() {
        this._layoutSubTree();
    }

    private _layoutSubTree() {
        let counter = 0;
        for (const child of this.children) {
            if (child instanceof Component) {
                let c = child as Component<ComponentOption>;
                c.$geometry._yOffset.row = counter;
                while (c && isRenderable(c)) {
                    c = c.children[0] as Component<ComponentOption>;
                    c.$geometry._yOffset.row = counter;
                }
                counter += c.$geometry.height;
            } else {
                throw Error(`Rows can only contain Components as direct child`);
            }
        }
        this.$geometry.height = counter;
    }
}
