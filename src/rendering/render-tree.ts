import config from "../config";
import { BaseElement } from "../element/base-element";
import { ActualElement, Component } from "../element/component";
import { ComponentOption } from "../element/component-options";
import { getComponent } from "../element/get-component";
import { isRenderable } from "../element/is";
import { adjustByAnchor, layoutElement } from "../layout/layout";
import { ElementDef, kLazyElement, NormalElementDef, OptDict } from "./element-def";

// @ts-ignore
import shallowEqArrays from "shallow-equal/arrays";

const INHERITED_PROPS = ["x", "y", "width", "height", "anchor", "rotation", "visible"];

const currElements: Component<ComponentOption>[] = [];
const currElement = () => currElements[currElements.length - 1];
let currElementInheriting = false;

const currCoordRoots: Component<ComponentOption>[] = [];
const currCoordRoot = () => (currCoordRoots.length === 0 ? null : currCoordRoots[currCoordRoots.length - 1]);
const currCoordSystems: ("polar" | "cartesian")[] = ["cartesian"];
const currCoordSystem = () => currCoordSystems[currCoordSystems.length - 1];

let xScaleSystemChanged = false;
let yScaleSystemChanged = false;

function findComponent(component: Component, name: string, id: number | string): [ActualElement, boolean] {
    const ctor = getComponent(isRenderable(component) ? component : (component as any).$parent, name);
    const comp = component.findChild(id, name || "Component");
    if (comp) {
        comp._isActive = true;
        comp._reordered = false;
        return [comp, false];
    }
    const newElm = new ctor(id);
    newElm._name = name;
    component.append(newElm);
    let c: Component<ComponentOption>;
    if ((c = currElement())) {
        newElm.$parent = c;
        if (currElementInheriting) {
            newElm.logicalParent = c;
        }
    }
    return [newElm, true];
}

function shouldUpdateElement(elm: ActualElement, opt: OptDict): boolean {
    if (elm.$v.forceRedraw) return true;
    if (elm.forceUpdate) {
        elm.forceUpdate = false;
        return true;
    }
    if (elm.shouldUpdate) {
        const result = elm.shouldUpdate();
        if (typeof result === "boolean") return result;
    }
    if (
        !((xScaleSystemChanged && elm.isInXScaleSystem) || (yScaleSystemChanged && elm.isInYScaleSystem)) &&
        elm.compareProps(opt.props)
    ) {
        return false;
    }
    return true;
}

export function updateTree(parent: Component, def_?: ElementDef, order?: number) {
    let elm: ActualElement;
    let created: boolean;
    let xScaleChangeRoot = false,
        yScaleChangeRoot = false;

    let def: NormalElementDef;
    if (!def_) {
        elm = parent;
    } else {
        [elm, created] = findComponent(parent, def_.tag, def_.id);

        def = def_[kLazyElement] ? (def_ as any).unfold(elm) : def_;
        const { opt } = def;

        if (order !== undefined) elm._order = order;

        if (opt.props.debug) {
            console.log("Rendering component:");
        }

        // inherit props
        if (currElementInheriting) {
            const p = currElement().prop;
            for (const prop of INHERITED_PROPS) {
                if (!(prop in opt.props) && prop in p) {
                    opt.props[prop] = p[prop];
                    if (prop === "width") (elm as Component)._inheritedWidth = true;
                    if (prop === "height") (elm as Component)._inheritedHeight = true;
                }
            }
        }

        if ("_initArg" in opt.props) {
            const initArgPropName = (elm.constructor as typeof BaseElement).propNameForInitializer();
            if (initArgPropName === null) {
                throw new Error(
                    `An initializer ${opt.props._initArg} is provided, but the component doesn't accept one.`,
                );
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

        const b = opt.props._behavior;
        if (b) {
            elm.setBehaviors(b);
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
            (elm as any).state.stage = opt.props.stage;
        }

        // ref
        const ce = currElement(),
            ref = opt.props.ref;
        if (ce && ref) {
            if (ref.endsWith("[]")) {
                const name = ref.substr(0, ref.length - 2),
                    r = ce.$ref[name];
                if (Array.isArray(r)) {
                    r.push(elm);
                } else {
                    ce.$ref[name] = [elm];
                }
            } else {
                ce.$ref[ref] = elm;
            }
        }

        if (!elm._firstRender) {
            if (isRenderable(elm)) {
                if (!shouldUpdateElement(elm, opt)) return;
            } else {
                if (opt.props["xScale"]) {
                    const s = opt.props.xScale;
                    const sn = (elm as Component)["_prop"].xScale;
                    if (
                        s.__scale__ &&
                        sn.__scale__ &&
                        s.type === sn.type &&
                        (s.domain === sn.domain || shallowEqArrays(s.domain, sn.domain)) &&
                        (s.range === sn.range || shallowEqArrays(s.range, sn.range))
                    ) {
                        xScaleSystemChanged = false;
                    } else {
                        xScaleChangeRoot = true;
                        xScaleSystemChanged = true;
                    }
                }
                if (opt.props["yScale"]) {
                    const s = opt.props.yScale;
                    const sn = (elm as Component)["_prop"].yScale;
                    if (
                        s.__scale__ &&
                        sn.__scale__ &&
                        s.type === sn.type &&
                        (s.domain === sn.domain || shallowEqArrays(s.domain, sn.domain)) &&
                        (s.range === sn.range || shallowEqArrays(s.range, sn.range))
                    ) {
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

        if (created) elm.$callHook("didCreate");
    }

    const newCoordSystem = elm instanceof Component && elm.prop.coord && elm.prop.coord !== currCoordSystem();
    elm.$coord = currCoordRoot()!;
    if (newCoordSystem) {
        currCoordRoots.push(elm as Component);
        currCoordSystems.push((elm as Component).prop!.coord!);
        (elm as Component).$isCoordRoot = true;
    } else {
        (elm as Component).$isCoordRoot = false;
    }

    elm.$callHook("willUpdate");

    elm._findActiveStage();
    elm.parseInternalProps();
    if (config.typeCheck) elm.performTypeCheck();

    layoutElement(elm);

    if (elm.prop.debug) console.log(elm);

    elm.$callHook("didLayout");

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
            // reset isActive status
            elm.children.forEach(c => (c._isActive = false));
            // z-index
            for (let i = 0, l = def!.children.length; i < l; i++) {
                const c = def!.children[i];
                if ("opt" in c && c.opt.props?.zIndex) {
                    // move element to the start
                    def!.children.splice(i, 1);
                    def!.children.push(c);
                }
            }
            // update children
            for (let i = 0, l = def!.children.length; i < l; i++) {
                updateTree(elm as Component, def!.children[i], i);
            }
            // sort
            let tmp, o;
            const d = elm.children;
            for (let i = 0, l = d.length; i < l; i++) {
                if (d[i]._reordered || !d[i]._isActive) continue;
                // if the order is wrong, there must exist a loop,
                // in which each element's order is the correct order of the previous one
                if (o !== i) {
                    // exchange the order with the next element, until all elements in this loop have correct orders
                    while (1) {
                        tmp = d[i];
                        if (!tmp._isActive || tmp._order === i) break;
                        o = tmp._order;
                        d[i] = d[o];
                        d[o] = tmp;
                        tmp._reordered = true;
                    }
                } else {
                    d[i]._reordered = true;
                }
                // loop through all elements to make sure all such loops are handled
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
