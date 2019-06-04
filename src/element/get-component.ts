import { Component } from "./component";

export const componentList: Record<string, any> = {};

export function getComponent(component: Component, name: string): typeof Component {
    if (component) {
        const localComponents =  (component.constructor as typeof Component).components;
        const visualizerComponents = component.$v.components;
        if (localComponents && name in localComponents)
            return localComponents[name];
        if (visualizerComponents && name in visualizerComponents)
            return visualizerComponents[name];
    }
    if (name in componentList)
        return componentList[name];
    throw new Error(`Cannot find element: ${name}`);
}
