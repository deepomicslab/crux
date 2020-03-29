import { parseNewick } from "../../../src/utils";
import dataStr from "./data";
import template from "./t";

const data = {
    data: parseNewick(dataStr),
};

export {
    template,
    data,
};
