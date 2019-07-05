import * as assert from "assert";
import { Component } from "../src/element/component";
import { registerDefaultGlobalComponents } from "../src/element/global";
import { updateTree } from "../src/rendering/render-tree";
import { template } from "../src/template/tag";

registerDefaultGlobalComponents();

const render1 = template`Component {}`;

describe("Render tree", () => {
    it("should render single root element", () => {
        const component = new Component(0, render1);
        const tree = updateTree(component);
        assert.equal(tree, {});
    });
});
