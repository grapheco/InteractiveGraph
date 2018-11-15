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

InteractiveGraphProtocol(IGP)定义了一系列基于HTTP协议的图数据交互接口。

IGP请求实际上是一个HTTP的POST请求，在查询字符串中包含一个`command`参数，在请求体中包括一个JSON参数，示例如下：

```
curl 'http://localhost:9999/graphserver/connector-neodb?command=getNodesInfo' -d '{"nodeIds":[84]}'
```
在此请求中，命令是`getNodesInfo`，参数是：
```
{
    "nodeIds": [84]
}
```
IGP的响应，实际上是一个响应体为JSON格式的HTTP响应。例如：

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
其中，一个JSON对象被作为`infos`属性返回，其中包含了一个数组，数组的内容是请求的节点集的相关属性（在此实例中请求的是nodeId为84的节点）。

每个IGP响应的响应头中都在`Content-Type`字段中指定了响应体内容和编码格式：`text/json;charset=utf-8`。对于跨域应用，一般还要求包含`Access-Control-Allow-Origin`的响应头。


## <a name='commandinit'></a>command=init
当客户端或浏览器尝试连接到此服务器时，发出此请求。

### <a name='requestparameter'></a>请求参数

此命令不要求参数，因此可以传递一个空对象。

例如:
```
{}
```

### <a name='responsebody'></a>响应体
包括内容如下：
| name | value type |description | example |
|--|--|--|--|
|product|string|product name of connector|'neo4j'|
|backendType|string|backend graphdb type, may be 'neo4j-db', 'neo4j-bolt' or 'neo4j-gson'|'neo4j-bolt'|
|nodesCount|number|number of nodes|327|
|edgesCount|number|number of edges|694|
|categories|object|categories of all nodes, in name-title pairs format|{"person": "人物"}|

例如:
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
当客户端/浏览器要加载整个图中的全部数据（包括节点和边）时，发出此请求。

### <a name='requestparameter-1'></a>请求参数
此命令不要求参数，因此可以传递一个空对象。

### <a name='responsebody-1'></a>响应体
包括内容如下：
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

例如:
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

当客户端/浏览器尝试取回一个节点的详细信息时，发出此请求。

### <a name='requestparameter-1'></a>请求参数

要求内容如下：
| name | value type |description | example |
|--|--|--|--|
|nodeIds|array\<number>|node ids|[84]|

例如:
```
{
    "nodeIds":[84]
}
```

### <a name='responsebody-1'></a>响应体

包括内容如下；
| name | value type |description | example |
|--|--|--|--|
|infos|array\<object>|informations of a set of requested nodes|["info in HTML format"]|

例如:
```
{
  "infos": [
    "\u003cp align\u003dcenter\u003e  \u003cimg width\u003d150 src\u003d\"./images/photo/贾宝玉.jpg\"\u003e\u003cbr\u003e  \u003cb\u003e贾宝玉[84]\u003c/b\u003e\u003c/p\u003e\u003cp align\u003dleft\u003e\"荣国府衔玉而诞的公子，贾政与王夫人之次子，阖府捧为掌上明珠，对他寄予厚望，他却走上了叛逆之路，痛恨八股文，批判程朱理学，给那些读书做官的人起名“国贼禄蠹”。他不喜欢“正经书”，却偏爱《牡丹亭》《西厢记》之类的“杂书”。他终日与家里的女孩们厮混，爱她们美丽纯洁，伤悼她们的薄命悲剧。\"\u003c/p\u003e"
  ]
}
```

## <a name='commandsearch'></a>command=search

当客户端/浏览器通过关键词搜索节点时，发出此请求。

### <a name='requestparameter-1'></a>请求参数
要求内容如下：
| name | value type |description | example |
|--|--|--|--|
|expr|string, or array\<object>|in full text search mode, expr is a search keyword; in strict match mode, expr is an array of object|'贾', or [{'label':'贾宝玉'},{'label':'贾政借钱'}]|
|limit|number|limit number of results|20|

例如:
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

### <a name='responsebody-1'></a>响应体

包含内容如下：
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

当客户端/浏览器尝试获取当前节点的邻居节点和边时，发出此请求。

### <a name='requestparameter-1'></a>请求参数

包括内容如下：
| name | value type |description | example |
|--|--|--|--|
|nodeIds|array\<number>|node ids|[84]|

例如:
```
{
    "nodeIds":[84]
}
```

### <a name='responsebody-1'></a>响应体
包括内容如下;
| name | value type |description | example |
|--|--|--|--|
|neighbourNodes|array\<NODE>|all neighbour nodes||
|neighbourEdges|array\<EDGE>|all neighbour edges||

例如:
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
当客户端/浏览器尝试启动关系查找任务时，发出此请求。

### <a name='requestparameter-1'></a>请求参数

包括内容如下：
| name | value type |description | example |
|--|--|--|--|
|startNodeId|number|start node id|84|
|endNodeId|number|end node id|106|
|maxDepth|number|max search depth|3|

例如:
```
{
    "startNodeId":84,
    "endNodeId":106,
    "maxDepth":3
}
```

### <a name='responsebody-1'></a>响应体

包括内容如下：
| name | value type |description | example |
|--|--|--|--|
|queryId|number|background query task id|1225|

例如:
```
{
  "queryId": 1225
}
```
## <a name='commandgetMoreRelations'></a>command=getMoreRelations

当客户端/浏览器尝试从关系查找任务中取出找出的关系时，发出此请求。

### <a name='requestparameter-1'></a>请求参数
包括内容如下：
| name | value type |description | example |
|--|--|--|--|
|queryId|number|background query task id|1225|

例如:
```
{
    "queryId":1225
}
```

### <a name='responsebody-1'></a>响应体

包括内容如下：
| name | value type |description | example |
|--|--|--|--|
|queryId|number|backend query task id|1225|
|completed|boolean|check if the query task is done|false|
|paths|array\<PATH>|found paths|[]|
|PATH.nodes|array\<NODE>|nodes in found paths|[]|
|PATH.edges|array\<EDGE>|edges in found paths|[]|

例如:
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

客户端/浏览器需要停止关系发现任务时，发出此请求。

### <a name='requestparameter-1'></a>request parameter
包括内容如下：
| name | value type |description | example |
|--|--|--|--|
|queryId|number|background query task id|1225|

例如:
```
{
    "queryId":1225
}
```

### <a name='responsebody-1'></a>响应体

包括内容如下：
| name | value type |description | example |
|--|--|--|--|
|queryId|number|backend query task id|1225|
|stopped|boolean|tells if the query task is stopped|false|

例如:
```
{
  "queryId": 1225,
  "stopped": true
}
```
