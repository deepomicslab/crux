import { componentList } from "./get-component";

import { Arrow, Axis, AxisBackground, AxisRadical, Legend } from "./auxiliary";

import {
    Area,
    Bars,
    Boxes,
    Contour,
    ContourDensity,
    Dots,
    GroupedBars,
    HeatMap,
    PieChart,
    RadarChart,
    Scatters1D,
    StackedArea,
    StackedBars,
    StepLine,
    UnequalBins,
    VennDiagram,
    Violins,
} from "./chart";
import { Component } from "./component";
import { Brush } from "./interaction";
import { Columns, Container, Rows } from "./layout";
import { XYPlot } from "./plot";
import {
    Arc,
    ArcLine,
    BitMapImage as Image,
    Circle,
    Line,
    Path,
    Polygon,
    Polyline,
    RadicalLine,
    Rect,
    Text,
    Triangle,
} from "./primitive";

import { GeneArea } from "./bioinfo";
import {
    Circos,
    CircosChord,
    CircosContentArea,
    CircosContentBar,
    CircosContentCytoband,
    CircosContentDot,
    CircosContentLine,
    CircosContentRect,
    CircosContentStackedDot,
    CircosContentText,
    CircosContentTicks,
    CircosLayer,
} from "./circos";
import { Tree } from "./common";

export function registerDefaultGlobalComponents() {
    registerComponent({
        Component,
        Circle,
        Rect,
        Text,
        Path,
        Line,
        Triangle,
        Arc,
        ArcLine,
        RadicalLine,
        Polyline,
        Polygon,
        Image,
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
        Arrow,
        Axis,
        AxisBackground,
        AxisRadical,
        Legend,
    });
}

export function registerDefaultBioInfoComponents() {
    registerComponent({
        GeneArea,
        Circos,
        CircosChord,
        CircosLayer,
        CircosContentArea,
        CircosContentBar,
        CircosContentCytoband,
        CircosContentDot,
        CircosContentLine,
        CircosContentRect,
        CircosContentStackedDot,
        CircosContentText,
        CircosContentTicks,
    });
}

export function registerComponent(components: { [name: string]: any }) {
    Object.keys(components).forEach(name => {
        componentList[name] = components[name];
    });
}
