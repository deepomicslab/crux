import { accumulatedData, bins, distData, revAccumulatedData, unequalData } from "./histogram-data";
import { hist2dData } from "./histogram-data-2d";
import { multiData, multiData2 } from "./histogram-data-multiline";
import { sideData } from "./histogram-data-side";
import { steplineData } from "./histogram-data-stepline";
import template from "./t";

const data = {
    hist_data: distData,
    hist2d_data: hist2dData,
    hist_cumulated: accumulatedData,
    hist_reverse_cumulated: revAccumulatedData,
    multiline: multiData,
    multiline2: multiData2,
    stepline: steplineData,
    unequal: unequalData,
    side_by_side: sideData,
    bins,
};

export {
    template,
    data,
};
