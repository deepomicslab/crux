import { Component } from "../component";
import { ComponentOption } from "../component-options";
import { isRenderable } from "../is";

export class Rows extends Component {
    public didLayoutSubTree() {
        let counter = 0;
        const autoWidth = this.widthIsNotDefined;
        let maxX = 0;
        for (const child of this.children) {
            if (!child._isActive) continue;
            if (child instanceof Component) {
                let c = child as Component<ComponentOption>;
                if (autoWidth) {
                    const mx = c.maxX;
                    if (mx > maxX) maxX = mx;
                }
                c.$geometry._yOffset.row = counter;
                while (c && isRenderable(c)) {
                    c = c.children[0] as Component<ComponentOption>;
                    c.$geometry._yOffset.row = counter;
                }
                counter += (c as Component).$geometry.height + (c as Component).$geometry.y;
            } else {
                throw Error(`Rows can only contain Components as direct child`);
            }
        }
        if (autoWidth) {
            this.$geometry.width = maxX;
        }
        this.$geometry.height = counter;
    }

    public defaultProp() {
        return { x: 0, y: 0 };
    }
}
