import { Behavior } from "./behavior";
import { Component } from "./element/component";
import { createComponent as c } from "./element/utils";
import { template as t } from "./template/tag";
import { visualize } from "./visualizer";

import * as algo from "./algo";
import * as color from "./color";
import * as use from "./ext/use";
import * as utils from "./utils";

import loadData from "./load-data";

import { currentEventContext } from "./event";
import IS_NODE from "./utils/is-node";

// tslint:disable-next-line: variable-name
const Crux = {
    visualize,
    Component,
    Behavior,
    t,
    c,
    use,

    utils,
    algo,
    color,

    loadData,
    event: currentEventContext,
};

export default Crux;

if (!IS_NODE) {
    window["Crux"] = Crux;
}
