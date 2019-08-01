import { componentList } from "./get-component";

import { Axis, AxisBackground, AxisRadical, Legend } from "./auxiliary";

import {
    Area, Bars, Boxes, Contour, ContourDensity, Dots, GroupedBars, HeatMap, PieChart, RadarChart,
    Scatters1D, StackedArea, StackedBars, StepLine, UnequalBins, VennDiagram, Violins,
} from "./chart";
import { Component } from "./component";
import { Brush } from "./interaction";
import { Columns, Container, Rows } from "./layout";
import { XYPlot } from "./plot";
import { Arc, ArcLine, Circle, Line, Path, Polygon, Polyline, RadicalLine, Rect, Text } from "./primitive";

import { GeneArea } from "./bioinfo";
import { Tree } from "./common";

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
        // common
        Tree,
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
        Scatters1D,
        PieChart,
        RadarChart,
        HeatMap,
        VennDiagram,
        Contour,
        ContourDensity,
        Violins,
        StepLine,
        UnequalBins,
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
