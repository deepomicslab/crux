import { Component } from "./element/component";
import { template } from "./template/tag";
import * as utils from "./utils";
import { visualize } from "./visualizer";

// tslint:disable-next-line: variable-name
export const Crux = {
    visualize,
    Component,
    template,
    utils,
};

window["Crux"] = Crux;
