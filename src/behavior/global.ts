import { Behavior } from "./behavior";
import Tooltip from "./tooltip";
import Zoom from "./zoom";

const behaviors = {
    "zoom": Zoom,
    "tooltip": Tooltip,
};

const defaultKeys = new Set(Object.keys(behaviors));

export function getBehavior(name: string) {
    return behaviors[name];
}

export function registerBehavior(name: string, behavior: Behavior) {
    if (defaultKeys.has(name)) {
        throw Error(`Cannot overwrite default behavior ${name}`);
    }
    if (!(behavior instanceof Behavior)) {
        throw Error(`Cannot register behavior: the object is not a behavior class`);
    }
    behaviors[name] = behavior;
}
