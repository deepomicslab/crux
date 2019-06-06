import { BaseElement } from "../element/base-element";
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
    stages: Record<string, Record<string, any>>;
    namedChildren: Record<string, () => any>;
}

export interface ElementDef {
    tag: string;
    opt: OptDict;
    children: ElementDef[];
}

const currElements: Component<ComponentOption>[] = [];
const currElement = () => currElements[currElements.length - 1];
let currElementInheriting = false;

const currCoordRoots: Component<ComponentOption>[] = [];
const currCoordRoot = () => currCoordRoots.length === 0 ? null : currCoordRoots[currCoordRoots.length - 1];
const currCoordSystems: ("polar" | "cartesian")[] = ["cartesian"];
const currCoordSystem = () => currCoordSystems[currCoordSystems.length - 1];

function findComponent(component: Component, name: string, id: number): [ActualElement, boolean] {
    const ctor = getComponent(component, name);
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
            console.log("Rendering component:");
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
                    if (prop === "width") (elm as any)._inheritedWidth = true;
                    if (prop === "height") (elm as any)._inheritedHeight = true;
                }
            }
        }

        if ("_initArg" in opt.props) {
            const initArgPropName = (elm.constructor as typeof BaseElement).propNameForInitializer();
            opt.props[initArgPropName] = opt.props._initArg;
        }
        opt.props.children = def.children;
        opt.props.namedChildren = def.opt.namedChildren || {};

        if (opt.on) elm.setEventHandlers(opt.on);
        if (opt.styles) elm.setStyles(opt.styles);
        if (opt.behaviors) elm.setBehaviors(opt.behaviors);
        if (opt.stages) elm.$stages = opt.stages;
        elm.setProp(opt.props);

        if (created)
            elm.$callHook("didCreate");
    }

    const newCoordSystem = elm instanceof Component &&
        elm.prop.coord && elm.prop.coord !== currCoordSystem();
    elm.$coord = currCoordRoot();
    if (newCoordSystem) {
        currCoordRoots.push(elm as Component);
        currCoordSystems.push((elm as Component).prop.coord);
        (elm as Component).$isCoordRoot = true;
    }

    layoutElement(elm);

    if (elm.prop.debug) {
        console.log(elm);
    }

    // ref
    const ce = currElement();
    if (ce && elm.prop.ref) {
        ce.$ref[elm.prop.ref] = elm;
    }

    elm.$callHook("__didLayout");
    elm.$callHook("didLayout");

    elm.parseInternalProps();

    if (isRenderable(elm)) {
        currElements.push(elm);
        currElementInheriting = true;

        elm.$callHook("willRender");
        const tree = elm.render();
        updateTree(elm, tree);

        currElements.pop();
    } else if (elm instanceof Component) {
        currElementInheriting = false;
        elm.children.forEach(c => c.isActive = false);
        for (const child of def.children) {
            updateTree(elm, child);
        }
    }

    if (newCoordSystem) {
        currCoordRoots.pop();
        currCoordSystems.pop();
    }

    elm.$callHook("didLayoutSubTree");
    elm.$callHook("willAdjustAnchor");
    adjustByAnchor(elm);

    elm.$callHook("didUpdate");
}
