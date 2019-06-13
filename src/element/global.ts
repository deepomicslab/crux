import { componentList } from "./get-component";

import { Axis, AxisBackground, AxisRadical, Legend } from "./auxiliary";
import { Area, Bars, Boxes, BoxesNotched, Dots, GroupedBars, PieChart, RadarChart, Scatters1D, StackedArea, StackedBars } from "./chart";
import { Component } from "./component";
import { Brush } from "./interaction";
import { Columns, Container, Rows } from "./layout";
import { XYPlot } from "./plot";
import { Arc, ArcLine, Circle, Line, Path, Polygon, Polyline, RadicalLine, Rect, Text } from "./primitive";

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
        Polyline,
        Polygon,
        // plot
        XYPlot,
        // chart
        Area,
        StackedArea,
        Bars,
        Boxes,
        BoxesNotched,
        Dots,
        StackedBars,
        GroupedBars,
        Scatters1D,
        PieChart,
        RadarChart,
        // layout
        Container,
        Rows,
        Columns,
        Brush,
        // other
        Axis,
        AxisBackground,
        AxisRadical,
        Legend,
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
