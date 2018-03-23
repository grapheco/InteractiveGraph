var GraphRAM = require("../../../build/service/ram").GraphRAM;

const gson = {
    data: {
        nodes: [
            { id: 'A' }, { id: '1' }, { id: '2' }, { id: '3' }, { id: 'B' }
        ],
        edges: [
            { id: 'A-1', from: 'A', to: '1' },
            { id: 'A-3(1)', from: 'A', to: '3' },
            { id: 'A-3(2)', from: 'A', to: '3' },
            { id: '1-2', from: '1', to: '2' },
            { id: '1-3', from: '1', to: '3' },            
            { id: '1-B', from: '1', to: 'B' },
            { id: '2-B', from: '2', to: 'B' },
            { id: '3-B', from: '3', to: 'B' },
        ]
    }
};

var graph = GraphRAM.fromGson(gson);

graph.requestInit(function () {
    var startNodeId = 'A';
    var endNodeId = 'B';
    var maxDepth = 6;
    var results = [];

    graph._findRelationsDFS(startNodeId, endNodeId, maxDepth, results, [], 0);
    console.log(results);

    results = [];
    graph._findRelationsBFS(startNodeId, endNodeId, maxDepth, results, [], 0);
    console.log(results);

    console.log(111);
});
