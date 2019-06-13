export default `//bvt
svg {
    width = auto
    height = 1600

    @let array = [1, 3, 8, 6, 5, 4, 2, 7, 3]
    @let array2 = [6, 4, 3, 2, 4, 9, 1, 5, 8]
    @let array3 = [3, 7, 2, 5, 6, 5, 7, 3, 4]
    @let boxData = {
        values: [
            [655, 850, 940, 980, 1070],
            [760, 800, 845, 885, 960],
            [780, 840, 855, 880, 940],
            [720, 767.5, 815, 865, 920],
            [740, 807.5, 810, 870, 950]
        ],
        outliers: [
            [ 0, 650 ], [ 2, 620 ], [ 2, 720 ], [ 2, 720 ], [ 2, 950 ], [ 2, 970 ]
        ],
        means: [
            899, 850, 859, 817.5, 835.5
        ],
    }
    @let fills = ["#aac9cecc", "#b6b4c2cc", "#c9bbc8cc", "#e5c1cdcc", "#f3d8cfcc"]

    Rows {
        Columns {
            height = 320
            Container{
                Text {text = "Box Plot"; anchor = @anchor("top", "center"); x=250}
                XYPlot {
                    height = 300
                    width = 500
                    padding-y = 20
                    padding-l = 40
                    data = { boxData }
                    Rect { fill = "#ffffff"; stroke="#000000" }
                    AxisBackground {
                        dashArray = "1, 2"
                    }
                    AxisBackground {
                        orientation = "vertical"
                        includeEndTicks = true
                        dashArray = "1, 2"
                    }
                    Boxes {
                        data = "boxData";
                        :box (_d) {
                            Rect.full  {
                                fill = "#00000000"
                                stroke = "#003366"
                                x = 33%
                                width = 33%
                            }
                        }
                        :median(d) {
                            Line {x1 = 33%; x2 = 66%; stroke = "#800080"; dashArray = "2, 2"}
                        }

                        :mean(means) {
                            Line {x1 = 33%; x2 = 66%; stroke = "#ed2939"}
                        }

                        :outlier {

                        }
                        :whiskle (d) {
                            Line { x1 = 41.25%; x2 = 57.75%; y1 = 0; y2 = 0; stroke = "#000" }
                            Line { x1 = 41.25%; x2 = 57.75%; y1 = 100%; y2 = 100%; stroke = "#000" }
                            Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#0078d7"; dashArray = "3, 2" }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") {}
                    Component {
                        x = -25; y = 50%
                        rotation = @rotate(-90)
                        Text("Label") { anchor = @anchor("bottom", "center") }
                    }
                    Text("Label") { x = 50%; y = 100%+15; anchor = @anchor("top", "center") }
                }
            }
            Container{
                Text {text = "Box Plot with Outliers"; anchor = @anchor("top", "center"); x=250}
                XYPlot {
                    height = 300
                    width = 500
                    padding-y = 20
                    padding-l = 40
                    data = { boxData }
                    Rect { fill = "#ffffff"; stroke="#000000" }
                    AxisBackground {
                        dashArray = "1, 2"
                    }
                    AxisBackground {
                        orientation = "vertical"
                        includeEndTicks = true
                        dashArray = "1, 2"
                    }
                    Boxes {
                        data = "boxData";
                        :box (_d) {
                            Rect.full  {
                                fill = "#00000000"
                                stroke = "#003366"
                                x = 33%
                                width = 33%
                            }
                        }
                        :median(d) {
                            Line {x1 = 33%; x2 = 66%; stroke = "#800080"; dashArray = "2, 2"}
                        }

                        :mean(means) {
                            Line {x1 = 33%; x2 = 66%; stroke = "#ed2939"}
                        }

                        :outlier(o) {
                            Circle.centered { r = 2; fill = "#ff4500" }
                        }
                        :whiskle (d) {
                            Line { x1 = 41.25%; x2 = 57.75%; y1 = 0; y2 = 0; stroke = "#000" }
                            Line { x1 = 41.25%; x2 = 57.75%; y1 = 100%; y2 = 100%; stroke = "#000" }
                            Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#0078d7"; dashArray = "3, 2" }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") {}
                    Component {
                        x = -25; y = 50%
                        rotation = @rotate(-90)
                        Text("Label") { anchor = @anchor("bottom", "center") }
                    }
                    Text("Label") { x = 50%; y = 100%+15; anchor = @anchor("top", "center") }
                }
            }
            Container{
                Text {text = "Box Plot Mean as Dots"; anchor = @anchor("top", "center"); x=250}
                XYPlot {
                    height = 300
                    width = 500
                    padding-y = 20
                    padding-l = 40
                    data = { boxData }
                    Rect { fill = "#ffffff"; stroke="#000000" }
                    AxisBackground {
                        dashArray = "1, 2"
                    }
                    AxisBackground {
                        orientation = "vertical"
                        includeEndTicks = true
                        dashArray = "1, 2"
                    }
                    Boxes {
                        data = "boxData";
                        :box (_d) {
                            Rect.full  {
                                fill = "#00000000"
                                stroke = "#003366"
                                x = 33%
                                width = 33%
                            }
                        }
                        :median(d) {
                            Line {x1 = 33%; x2 = 66%; stroke = "#800080"; dashArray = "2, 2"}
                        }

                        :mean(means) {
                            Circle.centered { r = 2; fill = "#ff4500"; x = 50%;}
                        }

                        :outlier {
                        }
                        :whiskle (d) {
                            Line { x1 = 41.25%; x2 = 57.75%; y1 = 0; y2 = 0; stroke = "#000" }
                            Line { x1 = 41.25%; x2 = 57.75%; y1 = 100%; y2 = 100%; stroke = "#000" }
                            Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#0078d7"; dashArray = "3, 2" }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") {}
                    Component {
                        x = -25; y = 50%
                        rotation = @rotate(-90)
                        Text("Label") { anchor = @anchor("bottom", "center") }
                    }
                    Text("Label") { x = 50%; y = 100%+15; anchor = @anchor("top", "center") }
                }
            }
        }
        Columns {
            height = 320
            Container{
                Text {text = "Box Plot (Color Varied)"; anchor = @anchor("top", "center"); x=250}
                XYPlot {
                    height = 300
                    width = 500
                    padding-y = 20
                    padding-l = 40
                    data = { boxData }
                    Rect { fill = "#ffffff"; stroke="#000000" }
                    AxisBackground {
                        dashArray = "1, 2"
                    }
                    AxisBackground {
                        orientation = "vertical"
                        includeEndTicks = true
                        dashArray = "1, 2"
                    }
                    Boxes {
                        data = "boxData";
                        :box (_d) {
                            Rect.full  {
                                fill = fills[_d.pos]
                                stroke = "#003366"
                                x = 33%
                                width = 33%
                            }
                        }
                        :median(d) {
                            Line {x1 = 33%; x2 = 66%; stroke = "#800080"; dashArray = "2, 2"}
                        }

                        :mean(means) {
                            Line {x1 = 33%; x2 = 66%; stroke = "#ed2939"}
                        }

                        :outlier {

                        }
                        :whiskle (d) {
                            Line { x1 = 41.25%; x2 = 57.75%; y1 = 0; y2 = 0; stroke = "#000" }
                            Line { x1 = 41.25%; x2 = 57.75%; y1 = 100%; y2 = 100%; stroke = "#000" }
                            Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#0078d7"; dashArray = "3, 2" }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") {}
                    Component {
                        x = -25; y = 50%
                        rotation = @rotate(-90)
                        Text("Label") { anchor = @anchor("bottom", "center") }
                    }
                    Text("Label") { x = 50%; y = 100%+15; anchor = @anchor("top", "center") }
                }
            }
            Container{
                Text {text = "Box Plot Horizontal"; anchor = @anchor("top", "center"); x=250}
                XYPlot {
                    height = 300
                    width = 500
                    padding-y = 20
                    padding-l = 40
                    flip = true
                    invertValueAxis = true
                    data = { boxData }
                    Rect { fill = "#ffffff"; stroke="#000000" }
                    AxisBackground {
                        dashArray = "1, 2"
                    }
                    AxisBackground {
                        orientation = "vertical"
                        includeEndTicks = true
                        dashArray = "1, 2"
                    }
                    Boxes {
                        data = "boxData";
                        :box (_d) {
                            Rect.full  {
                                fill = "#00000000"
                                stroke = "#003366"
                                y = 33%
                                height = 33%
                            }
                        }
                        :median(d) {
                            Line {y1 = 33%; y2 = 66%; stroke = "#800080"; dashArray = "2, 2"}
                        }

                        :mean(means) {
                            Line {y1 = 33%; y2 = 66%; stroke = "#ed2939"}
                        }

                        :outlier(o) {
                            Circle.centered { r = 2; fill = "#ff4500" }
                        }
                        :whiskle (d) {
                            Line { y1 = 41.25%; y2 = 57.75%; x1 = 0; x2 = 0; stroke = "#000" }
                            Line { y1 = 41.25%; y2 = 57.75%; x1 = 100%; x2 = 100%; stroke = "#000" }
                            Line { y1 = 50%; y2 = 50%; x1 = 0; x2 = 100%; stroke = "#0078d7"; dashArray = "3, 2" }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") {}
                    Component {
                        x = -25; y = 50%
                        rotation = @rotate(-90)
                        Text("Label") { anchor = @anchor("bottom", "center") }
                    }
                    Text("Label") { x = 50%; y = 100%+15; anchor = @anchor("top", "center") }
                }
            }
            Container{
                Text {text = "Box Swarm"; anchor = @anchor("top", "center"); x=250}
                XYPlot {
                    height = 300
                    width = 500
                    padding-y = 20
                    padding-l = 40
                    data = { boxData }
                    Rect { fill = "#ffffff"; stroke="#000000" }
                    AxisBackground {
                        dashArray = "1, 2"
                    }
                    AxisBackground {
                        orientation = "vertical"
                        includeEndTicks = true
                        dashArray = "1, 2"
                    }
                    Boxes {
                        data = "boxData";
                        :box (_d) {
                            Rect.full  {
                                fill = "#00000000"
                                stroke = "#003366"
                                x = 33%
                                width = 33%
                            }
                        }
                        :median(d) {
                            Line {x1 = 33%; x2 = 66%; stroke = "#800080"; dashArray = "2, 2"}
                        }

                        :mean(means) {
                            Circle.centered { r = 2; fill = "#ff4500"; x = 50%;}
                        }

                        :outlier {
                        }
                        :whiskle (d) {
                            Line { x1 = 41.25%; x2 = 57.75%; y1 = 0; y2 = 0; stroke = "#000" }
                            Line { x1 = 41.25%; x2 = 57.75%; y1 = 100%; y2 = 100%; stroke = "#000" }
                            Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#0078d7"; dashArray = "3, 2" }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") {}
                    Component {
                        x = -25; y = 50%
                        rotation = @rotate(-90)
                        Text("Label") { anchor = @anchor("bottom", "center") }
                    }
                    Text("Label") { x = 50%; y = 100%+15; anchor = @anchor("top", "center") }
                }
            }
        }
        Columns {
            height = 320
            Container{
                Text {text = "Box Notched"; anchor = @anchor("top", "center"); x=250}
                XYPlot {
                    height = 300
                    width = 500
                    padding-y = 20
                    padding-l = 40
                    data = { boxData }
                    Rect { fill = "#ffffff"; stroke="#000000" }
                    AxisBackground {
                        dashArray = "1, 2"
                    }
                    AxisBackground {
                        orientation = "vertical"
                        includeEndTicks = true
                        dashArray = "1, 2"
                    }
                    BoxesNotched {
                        data = "boxData";
                        :box (notchData) {
                            Path {d = notchData.path; fill = fills[notchData.pos]}
                        }
                        :whiskle (d) {
                            Line { x1 = 15%; x2 = 85%; y1 = 0; y2 = 0; stroke = "#000" }
                            Line { x1 = 15%; x2 = 85%; y1 = 100%; y2 = 100%; stroke = "#000" }
                            Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#0078d7"; dashArray = "3, 2" }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") {}
                    Component {
                        x = -25; y = 50%
                        rotation = @rotate(-90)
                        Text("Label") { anchor = @anchor("bottom", "center") }
                    }
                    Text("Label") { x = 50%; y = 100%+15; anchor = @anchor("top", "center") }
                }
            }
        }
        Columns{
            height = 500
            Container{
                height =500
                Text {text = "GeomBox"; anchor = @anchor("top", "center"); x=250}
                XYPlot {
                    height = 500
                    width = 400
                    padding-y = 20
                    padding-l = 40
                    data = { boxData }
                    Rect { fill = "#aaa"; stroke="#fff" }
                    AxisBackground {
                        stroke = "#fff"
                    }
                    AxisBackground {
                        orientation = "vertical"
                        includeEndTicks = true
                        stroke = "#fff"
                    }
                    Boxes {
                        data = "boxData";
                        :box (_d) {
                            Rect.full  {
                                fill = "#fff"
                                stroke = "#003366"
                                x = 33%
                                width = 33%
                            }
                        }
                        :median(d) {
                            Line {x1 = 33%; x2 = 66%; stroke = "#000"}
                        }

                        :mean {
                        }

                        :outlier(o) {
                            Circle.centered { r = 2; fill = "#000" }
                        }
                        :whiskle (d) {
                            Line { x1 = 50%; x2 = 50%; y1 = 0; y2 = 100%; stroke = "#000" }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") {}
                    Component {
                        x = -25; y = 50%
                        rotation = @rotate(-90)
                        Text("Label") { anchor = @anchor("bottom", "center") }
                    }
                    Text("Label") { x = 50%; y = 100%+15; anchor = @anchor("top", "center") }
                }
            }
            Container{
                Text {text = "GeomtransBox"; anchor = @anchor("top", "center"); x=250}
                XYPlot {
                    height = 500
                    width = 400
                    padding-y = 20
                    padding-l = 40
                    flip = true
                    invertValueAxis = true
                    data = { boxData }
                    Rect { fill = "#aaa"; stroke="#fff" }
                    AxisBackground {
                        stroke = "#fff"
                    }
                    AxisBackground {
                        orientation = "vertical"
                        includeEndTicks = true
                        stroke = "#fff"
                    }
                    Boxes {
                        data = "boxData";
                        :box (_d) {
                            Rect.full  {
                                fill = "#fff"
                                stroke = "#003366"
                                y = 33%
                                height = 33%
                            }
                        }
                        :median(d) {
                            Line {y1 = 33%; y2 = 66%; stroke = "#000"}
                        }

                        :mean {
                        }

                        :outlier(o) {
                            Circle.centered { r = 2; fill = "#000" }
                        }
                        :whiskle (d) {
                            Line { y1 = 50%; y2 = 50%; x1 = 0; x2 = 100%; stroke = "#000" }
                        }
                    }
                    Axis("bottom") { y = 100% }
                    Axis("left") {}
                    Component {
                        x = -25; y = 50%
                        rotation = @rotate(-90)
                        Text("Label") { anchor = @anchor("bottom", "center") }
                    }
                    Text("Label") { x = 50%; y = 100%+15; anchor = @anchor("top", "center") }
                }
            }
        }
    }
}
`;
