import IS_NODE from "./is-node";
import measureTextOffline from "./measure-text-offline";

let testTextElm: SVGTextElement;
let testCanvasContext: CanvasRenderingContext2D;

let useSVG = false;
let textSize = 12;
let textFont = "Arial";

const cachedWidth: Record<number, Record<string, Record<string, number>>> = {
    [textFont]: { [textSize]: {} },
};

const cachedHeight: Record<number, number> = {};

export function setMeasurementMethod(method: "svg" | "canvas") {
    useSVG = method === "svg";
}

export function setFont(font: string) {
    textFont = font;
}

export function measuredTextSize(
    text: string,
    size: number = textSize,
    family: string = "Arial",
): { width: number; height: number } {
    if (text.length === 0) return { width: 0, height: 0 };

    if (!(family in cachedWidth)) {
        cachedWidth[family] = {};
    }
    const cachedFamilyWidth = cachedWidth[family];
    if (cachedFamilyWidth[size]) {
        const width = cachedFamilyWidth[size][text];
        if (typeof width === "number") {
            return { width, height: cachedHeight[size] };
        }
    } else {
        cachedFamilyWidth[size] = {};
    }

    // measure
    let width: number;

    let fontChanged = false;
    if (size !== textSize) {
        textSize = size;
        fontChanged = true;
    }
    if (family !== textFont) {
        textFont = family;
        fontChanged = true;
    }

    if (IS_NODE) {
        width = measureTextOffline(text, { size });
        if (!cachedHeight[size]) {
            cachedHeight[size] = measureTextOffline("m", { size });
        }
    } else if (useSVG) {
        if (!testTextElm) testTextElm = createTestText();
        // update size
        if (fontChanged) {
            testTextElm.setAttribute("font-size", textSize);
            testTextElm.setAttribute("font-family", textFont);
        }
        // measure width
        testTextElm.textContent = text;
        width = testTextElm.getComputedTextLength();
        // measure height
        if (!cachedHeight[size]) {
            testTextElm.textContent = "m";
            cachedHeight[size] = testTextElm.getComputedTextLength();
        }
    } else {
        if (!testCanvasContext) testCanvasContext = createTestCanvasContext();
        // updtae size
        if (fontChanged) {
            testCanvasContext.font = `${textSize}px ${textFont}`;
        }
        // measure width
        width = testCanvasContext.measureText(text).width;
        // measure height
        if (!cachedHeight[size]) {
            cachedHeight[size] = testCanvasContext.measureText("m").width;
        }
    }

    cachedFamilyWidth[size][text] = width;
    return { width, height: cachedHeight[size] };
}

function createTestText(): SVGTextElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 0);
    svg.setAttribute("height", 0);
    document.body.appendChild(svg);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("font-family", textFont);
    text.setAttribute("font-size", textSize);
    text.setAttribute("visibility", "hidden");
    svg.append(text);
    return text;
}

function createTestCanvasContext(): CanvasRenderingContext2D {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("style", "display: none");
    const ctx = canvas.getContext("2d")!;
    ctx.font = `${textSize}px ${textFont}`;
    document.body.append(canvas);
    return ctx;
}
