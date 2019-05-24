import { componentList } from "./get-component";

import { Axis, AxisBackground } from "./auxiliary";
import { Area, Bars, Dots, StackedBars } from "./chart";
import { Component } from "./component";
import { Brush } from "./interaction";
import { Container, Rows } from "./layout";
import { XYPlot } from "./plot";
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
        // plot
        XYPlot,
        // chart
        Area,
        Bars,
        Dots,
        StackedBars,
        // layout
        Container,
        Rows,
        Brush,
        Axis,
        AxisBackground,
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
