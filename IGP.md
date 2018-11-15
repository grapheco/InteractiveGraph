<!-- vscode-markdown-toc -->
* [command=init](#commandinit)
	* [request parameter](#requestparameter)
	* [response body](#responsebody)
* [command=loadGraph](#commandloadGraph)
	* [request parameter](#requestparameter-1)
	* [response body](#responsebody-1)
* [command=getNodesInfo](#commandgetNodesInfo)
	* [request parameter](#requestparameter-1)
	* [response body](#responsebody-1)
* [command=search](#commandsearch)
	* [request parameter](#requestparameter-1)
	* [response body](#responsebody-1)
* [command=getNeighbours](#commandgetNeighbours)
	* [request parameter](#requestparameter-1)
	* [response body](#responsebody-1)
* [command=findRelations](#commandfindRelations)
	* [request parameter](#requestparameter-1)
	* [response body](#responsebody-1)
* [command=getMoreRelations](#commandgetMoreRelations)
	* [request parameter](#requestparameter-1)
	* [response body](#responsebody-1)
* [command=stopFindRelations](#commandstopFindRelations)
	* [request parameter](#requestparameter-1)
	* [response body](#responsebody-1)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->
# InteractiveGraphProtocol

InteractiveGraphProtocol(IGP) defines a set of graph interaction interfaces via HTTP protocol.

An IGP request is a HTTP POST request, which contains a `command` parameter in query string and a JSON parameter in request body, like:

```
curl 'http://localhost:9999/graphserver/connector-neodb?command=getNodesInfo' -d '{"nodeIds":[84]}'
```
Here, the command is `getNodesInfo` and the parameter is:
```
{
    "nodeIds": [84]
}
```

An IGP response is a HTTP response with a body in JSON format, like:

```
HTTP/1.1 200 OK
Server: Apache-Coyote/1.1
Access-Control-Allow-Origin: *
Content-Type: text/json;charset=utf-8
Content-Length: 669
Date: Sun, 14 Oct 2018 03:22:37 GMT
{
  "infos": [
    "\u003cp align\u003dcenter\u003e  \u003cimg width\u003d150 src\u003d\"./images/photo/贾宝玉.jpg\"\u003e\u003cbr\u003e  \u003cb\u003e贾宝玉[84]\u003c/b\u003e\u003c/p\u003e\u003cp align\u003dleft\u003e\"荣国府衔玉而诞的公子，贾政与王夫人之次子，阖府捧为掌上明珠，对他寄予厚望，他却走上了叛逆之路，痛恨八股文，批判程朱理学，给那些读书做官的人起名“国贼禄蠹”。他不喜欢“正经书”，却偏爱《牡丹亭》《西厢记》之类的“杂书”。他终日与家里的女孩们厮混，爱她们美丽纯洁，伤悼她们的薄命悲剧。\"\u003c/p\u003e"
  ]
}
```
Here, a JSON object is returned within a `infos` property, which contains an array of informations of a set of requested nodes(nodeIds=[84]).

Each IGP response has a `Content-Type` header with value `text/json;charset=utf-8`. For cross-domain applications, a `Access-Control-Allow-Origin` header is often required.

## <a name='commandinit'></a>command=init
Be requested when a client/browser is to connect to this server.

### <a name='requestparameter'></a>request parameter

This command requires no parameter, so pass an empty object is ok.

example:
```
{}
```

### <a name='responsebody'></a>response body

| name | value type |description | example |
|--|--|--|--|
|product|string|product name of connector|'neo4j'|
|backendType|string|backend graphdb type, may be 'neo4j-db', 'neo4j-bolt' or 'neo4j-gson'|'neo4j-bolt'|
|nodesCount|number|number of nodes|327|
|edgesCount|number|number of edges|694|
|categories|object|categories of all nodes, in name-title pairs format|{"person": "人物"}|

example:
```
{
  "edgesCount": 694,
  "nodesCount": 327,
  "backendType": "neo4j-db",
  "categories": {
    "person": "人物",
    "event": "事件",
    "location": "地点"
  },
  "product": "neo4j"
}
```
## <a name='commandloadGraph'></a>command=loadGraph
Be requested when a client/browser is to load whole graph data, including nodes and edges.

### <a name='requestparameter-1'></a>request parameter
This command requires no parameter, so pass an empty object is ok.

### <a name='responsebody-1'></a>response body

| name | value type |description | example |
|--|--|--|--|
|nodes|array\<NODE>|all nodes||
|NODE.id|number|node id|0|
|NODE.label|string|short title of a node|'共读西厢'|
|NODE.value|number|size of node|2|
|NODE.group|string|node group|'event'|
|NODE.categories|array\<string>|categories of node, a node may has serveral categories|['event']|
|edges|array\<EDGE>|all edges||
|EDGE.id|number|edge id|0|
|EDGE.label|string|short title of an edge|'参与'|
|EDGE.from|number|edge incoming node id|84|
|EDGE.to|number|outgoing node id|0|

example:
```
{
  "nodes": [
    {
      "label": "共读西厢",
      "id": 0,
      "categories": [
        "event"
      ],
      "value": 2,
      "group": "event"
    },
    {
      "image": "./images/photo/贾宝玉.jpg",
      "label": "贾宝玉",
       "id": 84,
      "categories": [
        "person"
      ],
      "value": 52,
      "group": "person"
    }
  ],
  "edges": [
    {
      "id": 33,
      "label": "参与",
      "from": 84,
      "to": 0
    }
  ]
}
```

## <a name='commandgetNodesInfo'></a>command=getNodesInfo
Be requested when a client/browser is to retrieve detailed information of a node.

### <a name='requestparameter-1'></a>request parameter
| name | value type |description | example |
|--|--|--|--|
|nodeIds|array\<number>|node ids|[84]|

example:
```
{
    "nodeIds":[84]
}
```

### <a name='responsebody-1'></a>response body

| name | value type |description | example |
|--|--|--|--|
|infos|array\<object>|informations of a set of requested nodes|["info in HTML format"]|

example:
```
{
  "infos": [
    "\u003cp align\u003dcenter\u003e  \u003cimg width\u003d150 src\u003d\"./images/photo/贾宝玉.jpg\"\u003e\u003cbr\u003e  \u003cb\u003e贾宝玉[84]\u003c/b\u003e\u003c/p\u003e\u003cp align\u003dleft\u003e\"荣国府衔玉而诞的公子，贾政与王夫人之次子，阖府捧为掌上明珠，对他寄予厚望，他却走上了叛逆之路，痛恨八股文，批判程朱理学，给那些读书做官的人起名“国贼禄蠹”。他不喜欢“正经书”，却偏爱《牡丹亭》《西厢记》之类的“杂书”。他终日与家里的女孩们厮混，爱她们美丽纯洁，伤悼她们的薄命悲剧。\"\u003c/p\u003e"
  ]
}
```

## <a name='commandsearch'></a>command=search
Be requested when a client/browser is to search nodes by keywords.

### <a name='requestparameter-1'></a>request parameter
| name | value type |description | example |
|--|--|--|--|
|expr|string, or array\<object>|in full text search mode, expr is a search keyword; in strict match mode, expr is an array of object|'贾', or [{'label':'贾宝玉'},{'label':'贾政借钱'}]|
|limit|number|limit number of results|20|

example:
```
{
    "expr":"贾",
    "limit":30
}
```
or
```
{
    "expr": [
        {
            "label":"贾宝玉"
        },
        {
            "label":"贾政借钱"
        }
    ],
    "limit":30
}
```

### <a name='responsebody-1'></a>response body

| name | value type |description | example |
|--|--|--|--|
|nodes|array\<NODE>|matched nodes||

example:
```
{
  "nodes": [
    {
      "label": "贾政借钱",
        "id": 33,
      "categories": [
        "event"
      ],
      "value": 2.0,
      "group": "event"
    },
    {
      "image": "./images/photo/贾宝玉.jpg",
      "label": "贾宝玉",
      "id": 84,
      "categories": [
        "person"
      ],
      "value": 52.0,
      "group": "person"
    }
  ]
}
```

## <a name='commandgetNeighbours'></a>command=getNeighbours
Be requested when a client/browser is to get beighbour nodes and edges of current node.

### <a name='requestparameter-1'></a>request parameter
| name | value type |description | example |
|--|--|--|--|
|nodeIds|array\<number>|node ids|[84]|

example:
```
{
    "nodeIds":[84]
}
```

### <a name='responsebody-1'></a>response body

| name | value type |description | example |
|--|--|--|--|
|neighbourNodes|array\<NODE>|all neighbour nodes||
|neighbourEdges|array\<EDGE>|all neighbour edges||

example:
```
{
  "neighbourEdges": [
    {
      "id": 14,
      "label": "母亲",
      "from": 84,
      "to": 206
    }
  ],
  "neighbourNodes": [
    {
      "image": "./images/photo/王夫人.jpg",
      "label": "王夫人",
      "id": 206,
      "categories": [
        "person"
      ],
      "value": 21.0,
      "group": "person"
    }
  ]
}
```

## <a name='commandfindRelations'></a>command=findRelations
Be requested when a client/browser is to start a FindRelation task.

### <a name='requestparameter-1'></a>request parameter
| name | value type |description | example |
|--|--|--|--|
|startNodeId|number|start node id|84|
|endNodeId|number|end node id|106|
|maxDepth|number|max search depth|3|

example:
```
{
    "startNodeId":84,
    "endNodeId":106,
    "maxDepth":3
}
```

### <a name='responsebody-1'></a>response body

| name | value type |description | example |
|--|--|--|--|
|queryId|number|background query task id|1225|

example:
```
{
  "queryId": 1225
}
```
## <a name='commandgetMoreRelations'></a>command=getMoreRelations
Be requested when a client/browser is to get found relations from a FindRelation task.

### <a name='requestparameter-1'></a>request parameter
| name | value type |description | example |
|--|--|--|--|
|queryId|number|background query task id|1225|

example:
```
{
    "queryId":1225
}
```

### <a name='responsebody-1'></a>response body

| name | value type |description | example |
|--|--|--|--|
|queryId|number|backend query task id|1225|
|completed|boolean|check if the query task is done|false|
|paths|array\<PATH>|found paths|[]|
|PATH.nodes|array\<NODE>|nodes in found paths|[]|
|PATH.edges|array\<EDGE>|edges in found paths|[]|

example:
```
{
  "queryResults": {
    "completed": true,
    "queryId": 1225,
    "paths": [
      {
        "nodes": [
          {
            "image": "./images/photo/贾宝玉.jpg",
            "label": "贾宝玉",
            "id": 84,
            "categories": [
              "person"
            ],
            "value": 52.0,
            "group": "person"
          },
          {
            "label": "海棠诗社",
            "id": 2,
            "categories": [
              "event"
            ],
            "value": 8.0,
            "group": "event"
          }
        ],
        "edges": [
          {
            "id": 35,
            "label": "参与",
            "from": 84,
            "to": 2
          },
          {
            "id": 362,
            "label": "参与",
            "from": 193,
            "to": 2
          }
        ]
      }
    ]
  }
}
```
## <a name='commandstopFindRelations'></a>command=stopFindRelations
Be requested when a client/browser is to stop a FindRelation task.

### <a name='requestparameter-1'></a>request parameter
| name | value type |description | example |
|--|--|--|--|
|queryId|number|background query task id|1225|

example:
```
{
    "queryId":1225
}
```

### <a name='responsebody-1'></a>response body

| name | value type |description | example |
|--|--|--|--|
|queryId|number|backend query task id|1225|
|stopped|boolean|tells if the query task is stopped|false|

example:
```
{
  "queryId": 1225,
  "stopped": true
}
```
