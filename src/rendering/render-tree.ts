import { ActualElement, Component } from "../element/component";
import { ComponentOption } from "../element/component-options";
import { getComponent } from "../element/get-component";
import { isPrimitive, isRenderable } from "../element/is";
import { adjustByAnchor, layoutElement } from "../layout/layout";
import { eq } from "./eq";

export interface OptDict {
    props: Record<string, any>;
    on: Record<string, any>;
    id: number;
    styles: Record<string, string>;
}

export interface ElementDef {
    tag: string;
    opt: OptDict;
    children: ElementDef[];
}

let currElement: Component<ComponentOption>;

function findComponent(component: Component, name: string, id: number): [ActualElement, boolean] {
    const ctor = getComponent(name);
    const comp = component.children.find(c => c instanceof ctor && c.id === id);
    if (comp) {
        comp.isActive = true;
        return [comp, false];
    }
    const newElm = new ctor(id);
    component.append(newElm);
    if (currElement) newElm.logicalParent = currElement;
    return [newElm, true];
}

export function updateTree(parent: Component<ComponentOption>, def?: ElementDef) {
    let elm: ActualElement;
    let created: boolean;
    if (!def) {
        elm = parent;
    } else {
        const { tag, opt } = def;
        const key = typeof opt.props.key === "undefined" ? opt.id : opt.props.key;
        [elm, created] = findComponent(parent, tag, key);
        // if (!created && (isRenderable(elm) || isPrimitive(elm)) && eq(elm.prop, opt.props)) {
        //     return;
        // }
        elm.setProp(opt.props);
        if (opt.on) elm.setEventHandlers(opt.on);
        if (opt.styles) elm.setStyles(opt.styles);
        if (created)
            elm.$callHook("didCreate");
    }

    layoutElement(elm);
    elm.parseInternalProps();

    // ref
    if (elm.prop.ref && currElement) {
        currElement.$ref[elm.prop.ref] = elm;
    }

    elm.$callHook("didLayout");

    if (isRenderable(elm)) {
        currElement = elm;
        const tree = elm.render();
        updateTree(elm, tree);
        currElement = null;
    } else if (elm instanceof Component) {
        currElement = null;
        elm.children.forEach(c => c.isActive = false);
        for (const child of def.children) {
            updateTree(elm, child);
        }
    }

    elm.$callHook("didLayoutSubTree");
    adjustByAnchor(elm);

    elm.$callHook("didUpdate");
}
