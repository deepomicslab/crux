export default `//bvt
@load data {
    url: "http://localhost:36012/file-content?path=Projects%2FVirus%2Fvisual%2Foviz-studio%2Fworkspace%2Fdata%2Farray.json",
    type: "json",
}

svg  {
    height = 800
    Component {
        @for (d, i) in data {
            Rect {
                x = i * 100
                width = 80
                height = d * 10
            }
        }
    }
}
`;
