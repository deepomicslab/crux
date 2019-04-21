import { Component } from "./component";

export const componentList: Record<string, any> = {};

export function getComponent(name: string): typeof Component {
    if (name in componentList) {
        return componentList[name];
    }
    throw new Error(`Cannot find element: ${name}`);
}
