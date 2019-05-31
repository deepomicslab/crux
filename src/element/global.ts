import { componentList } from "./get-component";

import { Axis, AxisBackground } from "./auxiliary";
import { Area, Bars, Boxes, Dots, GroupedBars, PieChart, StackedArea, StackedBars } from "./chart";
import { Component } from "./component";
import { Brush } from "./interaction";
import { Columns, Container, Rows } from "./layout";
import { XYPlot } from "./plot";
import { Arc, ArcLine, Circle, Line, Path, RadicalLine, Rect, Text } from "./primitive";

import { GeneArea } from "./bioinfo";

export function registerDefaultGlobalComponents() {
    registerGlobalComponent({
        Component,
        Circle,
        Rect,
        Text,
        Path,
        Line,
        Arc,
        ArcLine,
        RadicalLine,
        // plot
        XYPlot,
        // chart
        Area,
        StackedArea,
        Bars,
        Boxes,
        Dots,
        StackedBars,
        GroupedBars,
        PieChart,
        // layout
        Container,
        Rows,
        Columns,
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
