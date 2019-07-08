export interface NodeColor {
    border: string,
    background: string,
    highlight: {
        border: string,
        background: string
    },
    hover: {
        border: string,
        background: string
    }
}
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
    edges: {
        width: number,
        font: {
            size: number,
            color: string,
        },
        color: {
            inherit: string,
            opacity: number,
            color: string,
            highlight: string,
            hover: string,
        },
        selectionWidth: number,
        hoverWidth: number,
        arrows: {
            from?: {
                enabled: boolean,
                scaleFactor: number,
            },
            middle?: {
                enabled: boolean,
                scaleFactor: number,
            },
            to?: {
                enabled: boolean,
                scaleFactor: number,
            }
        },
        smooth: {
            enabled: boolean,
            type: string,
            roundness: number,
        }
    },
    nodes: {
        borderWidth: number,
        shape: string,
        scaling: {
            min: number,
            max: number
        },
        font: {
            size: number,
            strokeWidth: number
        }
    },
    groups?: {
        useSeqColors: boolean,
        SeqColors?:NodeColor[],
        custom?:{}
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
            },
            nodes: {
                borderWidth: 0,
                shape: 'dot',
                scaling: {
                    min: 10,
                    max: 30
                },
                font: {
                    size: 14,
                    strokeWidth: 7
                }
            },
            edges: {
                width: 0.01,
                font: {
                    size: 11,
                    color: 'green',
                },
                color: {
                    inherit: 'to',
                    opacity: 0.4,
                    color: '#cccccc',
                    highlight: '#ff0000',
                    hover: '#ff0000',
                },
                selectionWidth: 0.05,
                hoverWidth: 0.05,
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.5,
                    }
                },
                smooth: {
                    enabled: true,
                    type: 'continuous',
                    roundness: 0.5,
                }
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
            },
            nodes: {
                borderWidth: 0,
                shape: 'dot',
                scaling: {
                    min: 10,
                    max: 30
                },
                font: {
                    size: 14,
                    strokeWidth: 7
                }
            },
            edges: {
                width: 0.01,
                font: {
                    size: 11,
                    color: 'green',
                },
                color: {
                    inherit: 'to',
                    opacity: 0.4,
                    color: '#cccccc',
                    highlight: '#ff0000',
                    hover: '#ff0000',
                },
                selectionWidth: 0.05,
                hoverWidth: 0.05,
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.5,
                    }
                },
                smooth: {
                    enabled: true,
                    type: 'continuous',
                    roundness: 0.5,
                }
            }
        };
    }

    static LIGHT(): Theme {
        return {
            canvasBackground: "#F3F3F3",
            highlight: {
                gradientInnerColor: "rgb(67, 216, 253)",
                gradientOutterColor: "#F3F3F3",
            },
            expansion: {
                backgroudColorCollapsed: "rgba(127, 127, 127, 0.9)",
                backgroudColorExpanded: "rgba(67, 216, 253, 0.5)",
                fontColor: "#FFFFFF"
            },
            nodes: {
                borderWidth: 0,
                shape: 'dot',
                scaling: {
                    min: 10,
                    max: 30
                },
                font: {
                    size: 14,
                    strokeWidth: 7
                }
            },
            edges: {
                width: 0.02,
                font: {
                    size: 0,
                    color: '3cc5e7',
                },
                color: {
                    inherit: 'to',
                    opacity: 1,
                    color: '#cccccc',
                    highlight: '#3cc5e7',
                    hover: '#3cc5e7',
                },
                selectionWidth: 1,
                hoverWidth: 1,
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.5,
                    }
                },
                smooth: {
                    enabled: true,
                    type: 'continuous',
                    roundness: 0.5,
                }
            },
            groups: {
                useSeqColors: true,
                SeqColors:[

                    {border: "#FFFFFF", background: "#3cc5e7", highlight: {border: "#FFFFFF", background: "#4DD8FB"}, hover: {border: "#FFFFFF", background: "#4DD8FB"}},
                    {border: "#FFFFFF", background: "#fedb67", highlight: {border: "#FFFFFF", background: "#fae96e"}, hover: {border: "#FFFFFF", background: "#fae96e"}},
                    {border: "#FFFFFF", background: "#a2e5b9", highlight: {border: "#FFFFFF", background: "#a7f0c1"}, hover: {border: "#FFFFFF", background: "#a7f0c1"}},
                    {border: "#FFFFFF", background: "#6de0e3", highlight: {border: "#FFFFFF", background: "#7afcff"}, hover: {border: "#FFFFFF", background: "#7afcff"}},
                    {border: "#FFFFFF", background: "#3ea3d9", highlight: {border: "#FFFFFF", background: "#49c0ff"}, hover: {border: "#FFFFFF", background: "#49c0ff"}},
                    {border: "#FFFFFF", background: "#fd9f83", highlight: {border: "#FFFFFF", background: "#fcad8c"}, hover: {border: "#FFFFFF", background: "#fcad8c"}},
                    {border: "#FFFFFF", background: "#f97394", highlight: {border: "#FFFFFF", background: "#fd80a2"}, hover: {border: "#FFFFFF", background: "#fd80a2"}},
                    {border: "#FFFFFF", background: "#de64ad", highlight: {border: "#FFFFFF", background: "#f36ebd"}, hover: {border: "#FFFFFF", background: "#f36ebd"}},
                    {border: "#FFFFFF", background: "#d186be", highlight: {border: "#FFFFFF", background: "#fba0e5"}, hover: {border: "#FFFFFF", background: "#fba0e5"}},
                    {border: "#FFFFFF", background: "#e5bdf2", highlight: {border: "#FFFFFF", background: "#f2c7ff"}, hover: {border: "#FFFFFF", background: "#f2c7ff"}},
                    {border: "#FFFFFF", background: "#9d98f2", highlight: {border: "#FFFFFF", background: "#a6a1ff"}, hover: {border: "#FFFFFF", background: "#a6a1ff"}},
                    {border: "#FFFFFF", background: "#837be8", highlight: {border: "#FFFFFF", background: "#8f87ff"}, hover: {border: "#FFFFFF", background: "#8f87ff"}},
                    {border: "#FFFFFF", background: "#94bbf8", highlight: {border: "#FFFFFF", background: "#9ac2ff"}, hover: {border: "#FFFFFF", background: "#9ac2ff"}},
                ]
            }
        };
    }
}