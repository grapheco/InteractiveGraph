var GsonSource = require('../../../build/service/gson').GsonSource;

const data = require('/Users/bluejoe/IdeaProjects/grapheco-browser/debug/examples/honglou.json');
var gson = GsonSource.fromObject(data);

gson.requestInit(function () {
    gson.requestFindRelations(3863, 3885, 6, function () { });
});
