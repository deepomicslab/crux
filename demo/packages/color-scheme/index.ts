
import Crux from "../../../src";
import template from "./t";

Crux.use.theme("veryDark", {
    extends: "light",
    schemes: {
        main: {
            extends: "main",
            transform: c => c.shiftHue(-10),
        },
        s2: ["$theme", "#aff", "#ffa"],
    },
});

export {
    template,
};
