import { Behavior } from "./behavior";
import { Component } from "./element/component";
import { createComponent as c } from "./element/utils";
import { template as t } from "./template/tag";
import { visualize } from "./visualizer";

import * as algo from "./algo";
import * as color from "./color";
import * as use from "./ext/use";
import * as utils from "./utils";

import config from "./config";
import loadData from "./load-data";

import { currentEventContext } from "./event";
import IS_NODE from "./utils/is-node";

// tslint:disable-next-line: variable-name
const Oviz = {
    visualize,
    Component,
    Behavior,
    t,
    c,
    use,

    config,
    utils,
    algo,
    color,

    loadData,
    event: currentEventContext,
};

export default Oviz;

if (!IS_NODE) {
    window["Oviz"] = Oviz;
}
