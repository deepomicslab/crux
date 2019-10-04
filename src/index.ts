import { Component } from "./element/component";
import { createComponent as component } from "./element/utils";
import { template } from "./template/tag";
import { visualize } from "./visualizer";

import * as algo from "./algo";
import * as utils from "./utils";

import config from "./config";
import loadData from "./load-data";

// tslint:disable-next-line: variable-name
const Crux = {
    visualize,
    Component,
    template,
    component,
    utils,
    algo,
    loadData,
    config,
};

export default Crux;

window["Crux"] = Crux;
