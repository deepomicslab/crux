import { BaseElement } from "../element/base-element";
import { ActualElement, Component } from "../element/component";
import { ComponentOption } from "../element/component-options";
import { getComponent } from "../element/get-component";
import { isRenderable } from "../element/is";
import { adjustByAnchor, layoutElement } from "../layout/layout";

// @ts-ignore
import shallowEqArrays from "shallow-equal/arrays";

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

let xScaleSystemChanged = false;
let yScaleSystemChanged = false;

function findComponent(component: Component, name: string, id: number): [ActualElement, boolean] {
    const ctor = getComponent(isRenderable(component) ? component : (component as any).$parent, name);
    const comp = component.children.find(c => c instanceof ctor && c.id === id);
    if (comp) {
        comp.isActive = true;
        return [comp, false];
    }
    const newElm = new ctor(id);
    newElm._name = name;
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

function shouldUpdateElement(elm: ActualElement, opt: OptDict): boolean {
    if (elm.shouldNotSkipNextUpdate) {
        elm.shouldNotSkipNextUpdate = false;
        return true;
    }
    if (!((xScaleSystemChanged && elm.isInXScaleSystem) || (yScaleSystemChanged && elm.isInYScaleSystem)) &&
        elm.compareProps(opt.props)) {
        return false;
    }
    return true;
}

export function updateTree(parent: Component<ComponentOption>, def?: ElementDef) {
    let elm: ActualElement;
    let created: boolean;
    let xScaleChangeRoot = false, yScaleChangeRoot = false;

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
                    if (prop === "width") (elm as Component)._inheritedWidth = true;
                    if (prop === "height") (elm as Component)._inheritedHeight = true;
                }
            }
        }

        if ("_initArg" in opt.props) {
            const initArgPropName = (elm.constructor as typeof BaseElement).propNameForInitializer();
            if (initArgPropName === null) {
                throw new Error(`An initializer ${opt.props._initArg} is provided, but the component doesn't accept one.`);
            }
            opt.props[initArgPropName] = opt.props._initArg;
        }
        opt.props.children = def.children;
        opt.props.namedChildren = def.opt.namedChildren || {};

        if (opt.on) elm.setEventHandlers(opt.on);
        if (opt.styles) elm.setStyles(opt.styles);
        if (opt.behaviors) elm.setBehaviors(opt.behaviors);
        if (opt.stages) elm.$stages = opt.stages;

        const o = opt.props._on;
        if (o) {
            elm.setEventHandlers(o);
        }

        const s = opt.props._stages;
        if (s) {
            Object.keys(s).forEach(k => {
                if (elm.$stages[k]) {
                    elm.$stages[k] = { ...elm.$stages[k], ...s[k] };
                } else {
                    elm.$stages[k] = s[k];
                }
            });
        }

        if ("stage" in opt.props) {
            elm.setStage(opt.props.stage, true);
        }

        if (!elm._firstRender) {
            if (isRenderable(elm)) {
                if (!shouldUpdateElement(elm, opt)) return;
            } else {
                if (opt.props["xScale"]) {
                    const s = opt.props.xScale;
                    const sn = (elm as Component)["_prop"].xScale;
                    if (s.__scale__ && sn.__scale__ &&
                        s.type === sn.type &&
                        (s.domain === sn.domain || shallowEqArrays(s.domain, sn.domain)) &&
                        (s.range === sn.range || shallowEqArrays(s.range, sn.range))) {
                        xScaleSystemChanged = false;
                    } else {
                        xScaleChangeRoot = true;
                        xScaleSystemChanged = true;
                    }
                }
                if (opt.props["yScale"]) {
                    const s = opt.props.yScale;
                    const sn = (elm as Component)["_prop"].yScale;
                    if (s.__scale__ && sn.__scale__ &&
                        s.type === sn.type &&
                        (s.domain === sn.domain || shallowEqArrays(s.domain, sn.domain)) &&
                        (s.range === sn.range || shallowEqArrays(s.range, sn.range))) {
                        yScaleSystemChanged = false;
                    } else {
                        yScaleChangeRoot = true;
                        yScaleSystemChanged = true;
                    }
                }
            }
        }
        if (elm instanceof Component) elm.$ref = {};

        elm.setProp(opt.props);

        if (created)
            elm.$callHook("didCreate");
    }

    const newCoordSystem = elm instanceof Component &&
        elm.prop.coord && elm.prop.coord !== currCoordSystem();
    elm.$coord = currCoordRoot()!;
    if (newCoordSystem) {
        currCoordRoots.push(elm as Component);
        currCoordSystems.push((elm as Component).prop!.coord!);
        (elm as Component).$isCoordRoot = true;
    }

    elm.$callHook("willUpdate");

    elm._findActiveStage();
    layoutElement(elm);

    if (elm.prop.debug) {
        console.log(elm);
    }

    // ref
    const ce = currElement(), ref = elm.prop.ref;
    if (ce && ref) {
        if (ref.endsWith("[]")) {
            const name = ref.substr(0, ref.length - 2), r = ce.$ref[name];
            if (Array.isArray(r)) {
                r.push(elm);
            } else {
                ce.$ref[name] = [elm];
            }
        } else {
            ce.$ref[ref] = elm;
        }
    }

    elm.$callHook("__didLayout");
    elm.$callHook("didLayout");

    elm.parseInternalProps();

    if (isRenderable(elm)) {
        currElements.push(elm);
        currElementInheriting = true;

        elm.$callHook("willRender");
        const tree = elm.render!();
        elm.$callHook("didRender");
        updateTree(elm, tree);

        currElements.pop();
    } else if (elm instanceof Component) {
        currElementInheriting = false;
        if (!elm.isStatic || elm._firstRender) {
            elm.children.forEach(c => c.isActive = false);
            for (const child of def!.children) {
                updateTree(elm, child);
            }
        }
    }

    if (newCoordSystem) {
        currCoordRoots.pop();
        currCoordSystems.pop();
    }

    if (xScaleChangeRoot) xScaleSystemChanged = false;
    if (yScaleChangeRoot) yScaleSystemChanged = false;

    elm.$callHook("didLayoutSubTree");
    elm.$callHook("willAdjustAnchor");
    adjustByAnchor(elm);

    elm.$callHook("didUpdate");
    elm._firstRender = false;
}
