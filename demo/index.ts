import Oviz from "../src/index";

Oviz.config.typeCheck = true;

import { registerDefaultBioInfoComponents } from "../src/element/global";

declare global {
    interface Window {
        $v: any;
    }
}

interface Demo {
    template: string;
    data?: any;
    loadData?: any;
    components?: any;
}

registerDefaultBioInfoComponents();

async function init() {
    const demo: Demo = await import("./packages/tree");
    // demo regression plot
    window.$v = Oviz.visualize({
        el: "#canvas",
        template: demo.template,

        // loadData
        loadData: { ...(demo.loadData || null) },

        // data
        data: { ...(demo.data || null) },

        // data
        components: { ...(demo.components || null) },
    }).visualizer;
}

async function sfc() {
    const demo = await (await import("./packages/sfc")).default;

    Oviz.visualize({
        el: "#canvas",
        template: demo,
        singleTemplate: true,
    });
}

document.addEventListener("DOMContentLoaded", init);
