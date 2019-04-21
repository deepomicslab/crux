import { ActualElement, Component } from "../element/component";
import { ComponentOption } from "../element/component-options";
import { isRenderable } from "../element/components/is-renderable";
import { getComponent } from "../element/get-component";
import { layoutElement } from "../layout/layout";

export interface OptDict {
    props: { [name: string]: any };
    uid: number;
}

export interface ElementDef {
    tag: string;
    opt: OptDict;
    children: ElementDef[];
}

function findComponent(component: Component, name: string, uid: number): ActualElement {
    const ctor = getComponent(name);
    const comp = component.children.find(c => c instanceof ctor && c.uid === uid);
    if (comp) { return comp; }
    const newElm = new ctor(uid);
    component.append(newElm);
    return newElm;
}

export function updateTree(parent: Component<ComponentOption>, def?: ElementDef) {
    let elm: ActualElement;
    if (!def) {
        elm = parent;
    } else {
        const { tag, opt } = def;
        const key = typeof opt.props.key === "undefined" ? opt.uid : opt.props.key;
        elm = findComponent(parent, tag, key);
        elm.setProp(opt.props);
    }

    layoutElement(elm);

    if (isRenderable(elm)) {
        const tree = elm.render();
        updateTree(elm, tree);
    } else if (elm instanceof Component) {
        for (const child of def.children) {
            updateTree(elm, child);
        }
    }

    elm._callHook("didRender");
}
