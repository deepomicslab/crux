import { ActualElement, Component } from "../element/component";
import { ComponentOption } from "../element/component-options";
import { getComponent } from "../element/get-component";
import { isPrimitive, isRenderable } from "../element/is";
import { adjustByAnchor, layoutElement } from "../layout/layout";

const INHERITED_PROPS = [
    "x", "y", "width", "height", "anchor", "rotation",
];

export interface OptDict {
    props: Record<string, any>;
    on: Record<string, any>;
    id: number;
    styles: Record<string, string>;
    behaviors: Record<string, Record<string, any>>;
}

export interface ElementDef {
    __children__?: boolean;
    tag: string;
    opt: OptDict;
    children: ElementDef[];
}

const currElements: Component<ComponentOption>[] = [];
const currElement = () => currElements[currElements.length - 1];
let currElementInheriting = false;

function findComponent(component: Component, name: string, id: number): [ActualElement, boolean] {
    const ctor = getComponent(name);
    const comp = component.children.find(c => c instanceof ctor && c.id === id);
    if (comp) {
        comp.isActive = true;
        return [comp, false];
    }
    const newElm = new ctor(id);
    component.append(newElm);
    let c: Component<ComponentOption>;
    if (c = currElement()) {
        newElm.$parent = c;
        if (currElementInheriting) {
            newElm.logicalParent = c;
        }
    }
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

        if (opt.props.debug) {
            console.log("d");
        }
        // if (!created && (isRenderable(elm) || isPrimitive(elm)) && eq(elm.prop, opt.props)) {
        //     return;
        // }

        // inherit props
        if (currElementInheriting) {
            const p = currElement().prop;
            for (const prop of INHERITED_PROPS) {
                if (!(prop in opt.props) && (prop in p)) {
                    opt.props[prop] = p[prop];
                }
            }
        }
        elm.setProp(opt.props);
        if (opt.on) elm.setEventHandlers(opt.on);
        if (opt.styles) elm.setStyles(opt.styles);
        if (opt.behaviors) elm.setBehaviors(opt.behaviors);
        if (created)
            elm.$callHook("didCreate");
    }

    layoutElement(elm);
    elm.parseInternalProps();

    if (elm.prop.debug) {
        console.log(elm);
    }

    // ref
    const ce = currElement();
    if (ce && elm.prop.ref) {
        ce.$ref[elm.prop.ref] = elm;
    }

    elm.$callHook("didLayout");

    if (isRenderable(elm)) {
        currElements.push(elm);
        currElementInheriting = true;

        elm.$callHook("willRender");
        const tree = elm.render();
        if (def && def.children.length > 0) insertChildren(elm, tree, def.children);
        updateTree(elm, tree);

        currElements.pop();
    } else if (elm instanceof Component) {
        currElementInheriting = false;
        elm.children.forEach(c => c.isActive = false);
        for (const child of def.children) {
            updateTree(elm, child);
        }
    }

    elm.$callHook("didLayoutSubTree");
    adjustByAnchor(elm);

    elm.$callHook("didUpdate");
}

function insertChildren(elm: Component, tree: ElementDef, children: ElementDef[]) {
    const index = tree.children.findIndex(c => c.__children__);
    if (index >= 0) {
        elm.willInsertChildren(children);
        tree.children.splice(index, 1, ...children);
        return;
    } else {
        for (const c of tree.children)
            insertChildren(elm, c, children);
    }
}