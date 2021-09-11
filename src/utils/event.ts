import * as _ from "lodash";
import IS_NODE from "./is-node";

declare global {
    interface Window {
        __BVD3_eventNames: Set<string>;
        __BVD3_listeners: { [name: string]: Listener[] };
        __BVD3_rpcReceivers: { [label: string]: Callback };
    }
}

function getWindowObject<T>(name: string, defaultVal: T): T {
    if (IS_NODE) {
        return defaultVal;
    }
    return window[name] || (window[name] = defaultVal);
}

const eventNames = getWindowObject("__BVD3_eventNames", new Set());
const listeners: Record<string, Listener[]> = getWindowObject("__BVD3_listeners", {});
const rpcReceivers: Record<string, RPCCallback> = getWindowObject("__BVD3_rpcReceivers", {});

export type Callback = (eventName: string, data?: any) => void;
export type RPCCallback = (data?: any) => any;

export class Listener {
    public id?: string;
    public eventName: string;
    public action: Callback;

    constructor(eventName: string, callback: Callback, id?: string) {
        this.eventName = eventName;
        this.action = callback;
        if (typeof id === "string") {
            this.id = id;
        }
    }

    public triggerCallback(data?: any) {
        this.action.call(null, this.eventName, data);
    }
}

export let on = (eventName: string, callback: Callback, id?: string) => {
    if (!eventNames.has(eventName)) {
        addEventName(eventName);
    }
    const curr = listeners[eventName].find(l => l.id === id);
    if (id && curr) {
        curr.action = callback;
        return;
    }
    listeners[eventName].push(new Listener(eventName, callback, id));
};

export let emit = (eventName: string, data?: any) => {
    if (!eventNames.has(eventName)) {
        return;
    }
    listeners[eventName].forEach(listener => {
        listener.triggerCallback(data);
    });
};

export let remove = (eventName: string, id?: string) => {
    if (!eventNames.has(eventName)) {
        return;
    }
    if (typeof id === "string") {
        _.remove(listeners[eventName], x => x.id === id);
    } else {
        listeners[eventName] = [];
    }
};

// rpc

export function rpcRegisterReceiver(label: string, callback: RPCCallback) {
    rpcReceivers[label] = callback;
}

export function rpc(label: string, data?: any): any {
    if (!rpcReceivers[label]) {
        return undefined;
    }
    return rpcReceivers[label].call(null, data);
}

export const CANVAS_READY = "canvas-ready";
export const CANVAS_MOUNTED = "canvas-mounted";
export const CANVAS_INITIALIZED = "canvas-initialized";
export const DATA_LOADING_STARTED = "data-loading-started";
export const DATA_LOADING_FINISHED = "data-loading-finished";
export const DATA_LOADING_FAILED = "data-loading-failed";
export const EDITOR_READY = "editor-ready";
export const BEFORE_DRAW = "will-draw";
export const AFTER_DRAW = "did-draw";

const addEventName = (name: string) => {
    eventNames.add(name);
    listeners[name] = [];
};
