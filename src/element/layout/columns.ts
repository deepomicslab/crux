import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { isRenderable } from "../is";

export class Columns extends Component {
    public didLayoutSubTree() {
        let counter = 0;
        const autoHeight = this.heightIsNotDefined;
        let maxY = 0;
        for (const child of this.children) {
            if (child instanceof Component) {
                let c = child as Component<ComponentOption>;
                if (autoHeight) {
                    const mx = c.maxY;
                    if (mx > maxY) maxY = mx;
                }
                c.$geometry._xOffset.column = counter;
                while (c && isRenderable(c)) {
                    c = c.children[0] as Component<ComponentOption>;
                    c.$geometry._xOffset.column = counter;
                }
                counter += c.$geometry.width;
            } else {
                throw Error(`Columns can only contain Components as direct child`);
            }
        }
        if (autoHeight) {
            this.$geometry.height = maxY;
        }
        this.$geometry.width = counter;
    }

    public defaultProp() {
        return { x: 0, y: 0 };
    }
}
