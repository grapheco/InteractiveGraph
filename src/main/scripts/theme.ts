export interface Theme {
    canvasBackground: string;
    highlight: {
        gradientInnerColor: string,
        gradientOutterColor: string,
    }
    expansion: {
        backgroudColorCollapsed: string,
        backgroudColorExpanded: string,
        fontColor: string
    }
}

export class Themes {
    static DEFAULT(): Theme {
        return {
            canvasBackground: "none",
            highlight: {
                gradientInnerColor: "#00FF00",
                gradientOutterColor: "#FFFFFF",
            },
            expansion: {
                backgroudColorCollapsed: "rgba(127, 127, 127, 0.9)",
                backgroudColorExpanded: "rgba(0, 128, 0, 0.9)",
                fontColor: "#FFFFFF"
            }
        };
    }

    static BLACK(): Theme {
        return {
            canvasBackground: "#111111",
            highlight: {
                gradientInnerColor: "yellow",
                gradientOutterColor: "black",
            },
            expansion: {
                backgroudColorCollapsed: "rgba(255, 0, 0, 0.9)",
                backgroudColorExpanded: "rgba(0, 255, 0, 0.5)",
                fontColor: "#FFFFFF"
            }
        };
    }
}