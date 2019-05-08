import { componentList } from "./get-component";

import { Axis } from "./auxiliary";
import { Area } from "./chart";
import { Component } from "./component";
import { Brush } from "./interaction";
import { Container, Rows } from "./layout";
import { Circle, Line, Path, Rect, Text } from "./primitive";

import { GeneArea } from "./bioinfo";

export function registerDefaultGlobalComponents() {
    registerGlobalComponent({
        Component,
        Circle,
        Rect,
        Text,
        Path,
        Line,
        Area,
        Container,
        Rows,
        Brush,
        Axis,
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
