import { Component } from "./element/component";
import { createComponent as c } from "./element/utils";
import { template as t } from "./template/tag";
import { visualize } from "./visualizer";

import * as algo from "./algo";
import * as utils from "./utils";

import loadData from "./load-data";

import {
    registerComponent,
    registerDefaultBioInfoComponents,
    registerDefaultGlobalComponents,
} from "./element/global";

import { currentEventContext } from "./event";

// tslint:disable-next-line: variable-name
const Crux = {
    visualize,

    Component,
    register: {
        component: registerComponent,
        defaultBioInfoComponents: registerDefaultBioInfoComponents,
        defaultComponents: registerDefaultGlobalComponents,
    },

    t,
    c,

    utils,
    algo,
    loadData,
    event: currentEventContext,
};

export default Crux;

window["Crux"] = Crux;
