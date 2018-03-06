export interface Theme {
    canvasBackground: string;
    networkOptions: vis.Options;
}

export class Themes {
    static DEFAULT() {
        return {
            canvasBackground: "none",
            networkOptions: {
                nodes: {
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
                    width: 0.05,
                    font: {
                        size: 0,
                    },
                    color: {
                        highlight: '#ff0000',
                        hover: '#848484',
                    },
                    selectionWidth: 0.1,
                    arrows: {
                        from: {},
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
                physics: {
                    stabilization: false,
                    solver: 'forceAtlas2Based',
                    barnesHut: {
                        gravitationalConstant: -80000,
                        springConstant: 0.001,
                        springLength: 200
                    },
                    forceAtlas2Based: {
                        gravitationalConstant: -26,
                        centralGravity: 0.005,
                        springLength: 230,
                        springConstant: 0.18
                    },
                },
                interaction: {
                    tooltipDelay: 200,
                    hover: true,
                    hideEdgesOnDrag: true,
                    selectable: true,
                    navigationButtons: true,
                }
            }
        };
    }

    static BLACK() {
        return {
            canvasBackground: "#111111",
            networkOptions: {
                nodes: {
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
                    width: 0.05,
                    font: {
                        size: 0,
                    },
                    color: {
                        highlight: '#ff0000',
                        hover: '#848484',
                    },
                    selectionWidth: 0.1,
                    arrows: {
                        from: {},
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
                physics: {
                    stabilization: false,
                    solver: 'forceAtlas2Based',
                    barnesHut: {
                        gravitationalConstant: -80000,
                        springConstant: 0.001,
                        springLength: 200
                    },
                    forceAtlas2Based: {
                        gravitationalConstant: -26,
                        centralGravity: 0.005,
                        springLength: 230,
                        springConstant: 0.18
                    },
                },
                interaction: {
                    tooltipDelay: 200,
                    hover: true,
                    hideEdgesOnDrag: true,
                    selectable: true,
                    navigationButtons: true,
                }
            }
        };
    }
}