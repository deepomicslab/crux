import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { isRenderable } from "../is";

export class Columns extends Component {
    public didLayoutSubTree() {
        this._layoutSubTree();
    }

    private _layoutSubTree() {
        let counter = 0;
        for (const child of this.children) {
            if (child instanceof Component) {
                let c = child as Component<ComponentOption>;
                c.$geometry.x = counter;
                while (c && isRenderable(c)) {
                    c = c.children[0] as Component<ComponentOption>;
                    c.$geometry.x = counter;
                }
                counter += c.$geometry.width;
            } else {
                throw Error(`Columns can only contain Components as direct child`);
            }
        }
        this.$geometry.width = counter;
    }
}
