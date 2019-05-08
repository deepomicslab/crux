import { isFixed } from "../../defs/geometry";
import { layoutElement } from "../../layout/layout";
import { BaseElement } from "../base-element";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

type Paddings = [number, number, number, number];

export interface ContainerOption extends ComponentOption {
    padding: number;
    "padding-x": number;
    "padding-y": number;
}

function layoutDetachedChildren(el: BaseElement, check = true) {
    if (check && !el.$detached) return;
    layoutElement(el, true);
    if (el instanceof Component) {
        // skip if children's sizes don't depend on this component
        if (isFixed(el.prop.width) && isFixed(el.prop.height)) return;
        el.children.forEach(c => layoutDetachedChildren(c, false));
    }
}

export class Container extends Component<ContainerOption> {
    public didLayoutSubTree() {
        this._layoutSubTree();
    }

    private _layoutSubTree() {
        const [pt, pr, pb, pl] = this._getPadding();

        const realChildren = this.children.filter(c => !c.$detached);
        if (!this.prop.width) {
            realChildren.forEach(c => {
                c.$geometry.x += pl;
                let e = c;
                while (e["render"]) {
                    e = (e as Component).children[0];
                    e.$geometry.x += pl;
                }
            });
            const maxX = Math.max(...realChildren.map(c => c.maxX));
            this.$geometry.width = maxX + pr;
        }
        if (!this.prop.height) {
            realChildren.forEach(c => {
                if (c.$detached) return;
                c.$geometry.y += pt;
                let e = c;
                while (e["render"]) {
                    e = (e as Component).children[0];
                    e.$geometry.y += pt;
                }
            });
            const maxY = Math.max(...realChildren.map(c => c.maxY));
            this.$geometry.height = maxY + pb;
        }

        this.children.forEach(c => {
            layoutDetachedChildren(c);
        });
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
