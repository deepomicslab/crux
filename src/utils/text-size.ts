let testTextElm: SVGTextElement;
let testTextSize = 12;

const cachedWidth: Record<number, Record<string, number>> = {
    [testTextSize]: {},
};

const cachedHeight: Record<number, number> = {};

export function measuredTextSize(text: string, size: number = testTextSize): { width: number, height: number } {
    if (text.length === 0) return { width: 0, height: 0};

    if (!testTextElm) testTextElm = createTestText();

    if (cachedWidth[size]) {
        const width = cachedWidth[size][text];
        if (typeof width === "number") {
            return { width, height: cachedHeight[size] };
        }
    } else {
        cachedWidth[size] = {};
    }

    // measure
    if (size !== testTextSize) {
        testTextElm.setAttribute("font-size", testTextSize);
        testTextSize = size;
    }
    testTextElm.textContent = text;

    const bbox = testTextElm.getBBox();
    cachedWidth[size][text] = bbox.width;
    cachedHeight[size] = bbox.height;

    return { width: bbox.width, height: bbox.height };
}

function createTestText(): SVGTextElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 0);
    svg.setAttribute("height", 0);
    document.body.appendChild(svg);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("font-size", testTextSize);
    text.setAttribute("visibility", "hidden");
    svg.append(text);
    return text;
}
