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
    tooltip.setAttribute("style", Object.keys(tStyle).map(k => `${k}:${tStyle[k]}`).join(";"));
}

export function show(html: string, x: number, y: number): void;
export function show(html: string, ev: MouseEvent): void;
export function show(html: string) {
    if (!tooltip) create();
    style({
        display: "inline-block",
    });
    tooltip!.innerHTML = html;
    let x: number, y: number;
    if (arguments[1] instanceof Event) {
        x = arguments[1].clientX;
        y = arguments[1].clientY;
        move(x, y);
    } else {
        x = arguments[1]; y = arguments[2];
        move(x, y);
    }
    if (conf.moveWithCursor) {
        document.body.addEventListener("mousemove", mousemoved);
    }
}

export function hide() {
    if (!tooltip) return;
    style({ display: "none" });
    if (conf.moveWithCursor) {
        document.body.removeEventListener("mousemove", mousemoved);
    }
}

export function move(x: number, y: number) {
    if (!tooltip) return;
    if (conf.xAnchor !== "left" || conf.yAnchor !== "top") {
        const { width, height } = tooltip.getBoundingClientRect();
        switch (conf.xAnchor) {
            case "right": x -= width; break;
            case "center": x -= width / 2; break;
        }
        switch (conf.yAnchor) {
            case "bottom": y -= height; break;
            case "middle": y -= height / 2; break;
        }
    }
    style({ top: `${y + conf.yOffset}px`, left: `${x + conf.xOffset}px` });
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
    style(tStyle);
}

let tooltipCSS: HTMLStyleElement;
function addTooltipCSS() {
    if (tooltipCSS) return;
    tooltipCSS = document.createElement("style");
    tooltipCSS.innerHTML = `
    ._oviz-tooltip {
        display: inline-block;
        position: fixed;
        background: rgba(0,0,0,.75);
        color: #fff;
        padding: 4px;
        transition: top 0.02s, left 0.02s;
        border-radius: 3px;
        font-size: 11px;
        font-family: Arial;
        pointer-events: none;
    }`;
    document.head.appendChild(tooltipCSS);
}

function mousemoved(ev: MouseEvent) {
    move(ev.clientX, ev.clientY);
}
