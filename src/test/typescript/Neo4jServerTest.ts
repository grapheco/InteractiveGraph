/*
since you use typescript@2, you don't need the typings package anymore. 
This will now be handled via npm and the @types packages, 
available at $types/{your-package}, in your case @types/jquery
*/
import { RemoteGraph } from '../../main/typescript/service/remote';

var url = "http://localhost:9999/graphserver/graphviz-service";

var graph = new RemoteGraph(url);
graph.init();