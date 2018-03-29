import { MainFrame } from '../framework';
import { LocalGraph } from '../connector/local';

export abstract class BaseApp {
    protected _framework: MainFrame;

    protected constructor(args: any) {
        this._framework = this.createFramework(args);
    }

    abstract createFramework(args: any): MainFrame;

    public loadGson(url: string, callback) {
        this._framework.connect(LocalGraph.fromGsonFile(url), callback);
    }

    public connect(url: string, callback) {
        //remote
    }

    public scaleTo(scale: number, callback) {
        this._framework.scaleTo(scale);
        if (callback !== undefined)
            callback();
    }
}