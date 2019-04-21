import { componentList } from "./get-component";

import { Component } from "./component";
import { Circle, Rect, Text } from "./components";
import { Container, Rows } from "./layout";

import { GeneArea } from "./bioinfo";

export function registerDefaultGlobalComponents() {
    registerGlobalComponent({
        Component,
        Circle,
        Rect,
        Text,
        Container,
        Rows,
    });
}

export function registerDefaultBioInfoComponents() {
    registerGlobalComponent({
        GeneArea,
    });
}

export function registerGlobalComponent(components: { [name: string]: any}) {
    Object.keys(components).forEach(name => {
        componentList[name] = components[name];
    });
}
