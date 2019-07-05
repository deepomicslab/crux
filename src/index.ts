import * as algo from "./algo";
import { Component } from "./element/component";
import loadData from "./load-data";
import { template } from "./template/tag";
import * as utils from "./utils";
import { visualize } from "./visualizer";

// tslint:disable-next-line: variable-name
const Crux = {
    visualize,
    Component,
    template,
    utils,
    algo,
    loadData,
};

export default Crux;

window["Crux"] = Crux;
