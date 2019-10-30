export default `//bvt
svg {
    height = 600
    Columns {
        Container {
            padding = 80
            Rect.full.detached { fill = "#fff" }
            Rows {
                @let s = @themeColorScheme("light", 12)
                @for i in 12 {
                    Component {
                        width = 40
                        height = 40
                        Component.full("Rect") {
                            fill = s.get(i)
                        }
                    }
                }
            }
        }
        Container {
            padding = 80
            Rect.full.detached { fill = "#fff" }
            Rows {
                @let s = @themeColorScheme("veryDark", 12)
                @for i in 12 {
                    Component {
                        width = 40
                        height = 40
                        Component.full("Rect") {
                            fill = s.get(i)
                        }
                    }
                }
            }
        }
        Container {
            padding = 80
            Rect.full.detached { fill = "#000" }
            Rows {
                @let s = @themeColorScheme("dark", 12)
                @for i in 12 {
                    Component {
                        width = 40
                        height = 40
                        Component.full("Rect") {
                            fill = s.get(i)
                        }
                    }
                }
            }
        }
    }
}
`;
