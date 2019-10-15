import Crux from "../../../src";
import scatterData from "../scatter/scatter-data";
import template from "./t";

const data = {
    scatterData,
    regressionData: Crux.algo.simpleLinearRegression(scatterData).data,
    residualData: Crux.algo.confidenceBand(scatterData),
};

export {
    template,
    data,
};
