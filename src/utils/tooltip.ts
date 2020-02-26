let tooltip: HTMLDivElement | undefined;

interface TooltipConfig {
    moveWithCursor: boolean;
    xAnchor: "left" | "right" | "center";
    yAnchor: "top" | "bottom" | "middle";
    xOffset: number;
    yOffset: number;
}

const tStyle: Record<string, string> = {};

const conf: TooltipConfig = {
    moveWithCursor: true,
    xAnchor: "left",
    yAnchor: "bottom",
    xOffset: 0,
    yOffset: 0,
};

let shown = false;

export function config(c: Partial<TooltipConfig>) {
    if ("moveWithCursor" in c) conf.moveWithCursor = c.moveWithCursor!;
    if ("xOffset" in c) conf.xOffset = c.xOffset!;
    if ("yOffset" in c) conf.yOffset = c.yOffset!;
    if ("xAnchor" in c) conf.xAnchor = c.xAnchor!;
    if ("yAnchor" in c) conf.yAnchor = c.yAnchor!;
}

export function style(s: Record<string, string> = {}) {
    if (!tooltip) return;
    Object.keys(s).forEach(k => tStyle[k] = s[k]);
    tooltip.setAttribute("style", Object.entries(tStyle).map(([k, v]) => `${k}:${v}`).join(";"));
}

let willShow = false;
let willHide = false;

export function show(html: string, x: number, y: number): void;
export function show(html: string, ev: MouseEvent): void;
export function show(html: string) {
    if (!tooltip) create();
    tooltip!.innerHTML = html;
    if (willHide) {
        willHide = false;
    } else {
        style({ display: "inline-block", visibility: "hidden" });
    }
    willShow = true;
    setTimeout(() => {
        delete tStyle.visibility;
        if (!willShow) return;
        let x: number, y: number;
        if (arguments[1] instanceof Event) {
            x = (arguments[1] as MouseEvent).clientX;
            y = (arguments[1] as MouseEvent).clientY;
        } else {
            x = arguments[1]; y = arguments[2];
        }
        move(x, y);
        style({ display: "inline-block" });
        shown = true;
        willShow = false;
    }, 0);
}

export function hide() {
    if (!tooltip) return;
    shown = false;
    willHide = true;
    willShow = false;
    setTimeout(() => {
        if (!willHide) return;
        delete tStyle.top;
        delete tStyle.left;
        style({ display: "none" });
        willHide = false;
    }, 5);
}

export function move(x: number, y: number) {
    if (!tooltip) return;
    const { width, height } = tooltip.getBoundingClientRect();
    if (conf.xAnchor !== "left" || conf.yAnchor !== "top") {
        switch (conf.xAnchor) {
            case "right": x -= width; break;
            case "center": x -= width / 2; break;
        }
        switch (conf.yAnchor) {
            case "bottom": y -= height; break;
            case "middle": y -= height / 2; break;
        }
    }
    let x_ = x + conf.xOffset;
    if (x_ + width > window.innerWidth) {
        x_ = window.innerWidth - width;
    }
    style({ top: `${y + conf.yOffset}px`, left: `${x_}px` });
}

function create() {
    createTooltip();

    for (const ev of ["turbolinks:load", "DOMContentLoaded"]) {
        document.addEventListener(ev, () => {
            if (!document.body.contains(tooltip!)) {
                createTooltip();
                return;
            }
        });
    }
}

function createTooltip() {
    addTooltipCSS();
    tooltip = document.createElement("div");
    tooltip.className = "_oviz-tooltip";
    document.body.appendChild(tooltip);
    if (conf.moveWithCursor) {
        document.body.addEventListener("mousemove", mousemoved);
    }
}

let tooltipCSS: HTMLStyleElement;
function addTooltipCSS() {
    if (tooltipCSS) return;
    tooltipCSS = document.createElement("style");
    tooltipCSS.innerHTML = `
    ._oviz-tooltip {
        display: none;
        position: fixed;
        background: rgba(0,0,0,.75);
        color: #fff;
        padding: 4px;
        transition: top 0.01s, left 0.01s;
        border-radius: 3px;
        font-size: 11px;
        font-family: Arial;
        pointer-events: none;
    }`;
    document.head.appendChild(tooltipCSS);
}

function mousemoved(ev: MouseEvent) {
    if (!shown) return;
    move(ev.clientX, ev.clientY);
}
