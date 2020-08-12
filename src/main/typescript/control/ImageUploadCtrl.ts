import {UIControl} from "./control";
import {MainFrame} from "../mainframe";
import {EVENT_ARGS_FRAME, FrameEventName} from "../types";
import htmlString = JQuery.htmlString;
import {getCommonBasePathOfArray} from "gulp-typescript/release/utils";

export class ImageUploadCtrl extends UIControl {

    protected _classname = 'imageUploadPanel';
    protected _dockable = false;
    protected _draggable = false;

    public _frame:MainFrame =null;
    public _modal: JQuery<HTMLElement> = null;
    public _modalCloser: JQuery<HTMLElement> = null;
    public _tabs: JQuery<HTMLElement> = null;
    public _tabContents: JQuery<HTMLElement> = null;
    public _fileUploader: Uploader = null;
    public _uploadBtns: JQuery<HTMLElement> = null;
    public _deleteBtns: JQuery<HTMLElement> = null;
    public _url:JQuery<HTMLElement> = null;
    public _cam:Camera = null;


    getTypeName(): string {
        return "ImageUploadCtrl";
    }

    public onBindElement(htmlContainer: HTMLElement, frame: MainFrame, args: EVENT_ARGS_FRAME) {
        this._frame = frame;
        this.insertDOM(htmlContainer);
        this._modal = $('.igraph-modal',htmlContainer);
        this._modalCloser = $('.igraph-modal-close', htmlContainer);
        this._tabs = $('.mt-tabpage-item',htmlContainer);
        this._tabContents  = $('.mt-tabpage-content',htmlContainer);
        this._uploadBtns = $(".igraph-upload", htmlContainer);
        this._deleteBtns = $('.igraph-uploader-delete',htmlContainer);
        this._url = $(".url", htmlContainer);

        this._frame.on(FrameEventName.IMAGEBOXOPEN,args=>{
            console.log('imagebox');
            this.openMe()
        })

        // modal close
        this._modalCloser.on('click',()=>{
            console.log("click close");
            if(this._cam.opening){
                this._cam.closeCam()
            }
            this._modal.hide()
        });

        // tabs change
        let that = this;
        this._tabs.on('click',function () {
            that.changeTabsCont($(this).index());
        });

        // bind file uploader
        this._fileUploader = new Uploader($('.igraph-uploader', htmlContainer));

        //url preview
        this._url.on('input propertychange', ()=>{
            $(".igraph-url-img", htmlContainer).attr('src',that._url.val().toString())
        })

        //bind cam
        this._cam = new Camera($('.igraph-cam',htmlContainer));

        //take photo
        $('.igraph-take',htmlContainer).on('click',()=>{
            this._cam.takePhoto()
        })

        /**
         * upload btns click event
         * */
        //local
        this._uploadBtns.eq(0).on('click',function(){
            frame.searchImage(that._fileUploader.file[0],(nodes)=>{
                that._frame.emit(FrameEventName.RESULTLISTPUT,nodes);
                that.hideMe()
            })
        });
        //url
        this._uploadBtns.eq(1).on('click', function () {
            frame.searchImage(that._url.val(), (nodes)=>{
                frame.emit(FrameEventName.RESULTLISTPUT,nodes);
                that.hideMe()
            })
        });
        //camera
        this._uploadBtns.eq(2).on('click', function () {
            frame.searchImage(that._cam.photo, (nodes)=>{
                frame.emit(FrameEventName.RESULTLISTPUT,nodes);
                that.hideMe()
            })
        });
        /**
         * delete btns click event
         * */
        //local
        this._deleteBtns.eq(0).on('click',()=>{
            this._fileUploader.cleanFile()
        })
        //url
        this._deleteBtns.eq(1).on('click',()=>{
            this._url.val("")
        })
        //camera
        this._deleteBtns.eq(2).on('click',()=>{
            this._cam.reTake()
        })
        return this;
    }

    // change tabs
    private changeTabsCont(index:number){
        this._tabs.removeClass('mt-tabpage-item-cur');
        this._tabs.eq(index).addClass('mt-tabpage-item-cur');
        this._tabContents.removeClass('mt-tabpage-content-cur');
        this._tabContents.eq(index).addClass('mt-tabpage-content-cur');
        //camera control
        if(this._cam.opening&&index!=2){
            this._cam.closeCam()
        }
        if(!this._cam.opening&&index==2&&(!this._cam.photo)){
            let success = this._cam.initCam()
            if(!success){
                //Browser incompatibility
                alert("Your browser is not compatible with this feature. Please try other ways.")
            }
        }

    }

    private openMe(){
        this._modal.show()
    }

    private hideMe(){
        this._modalCloser.click()
    }

    //upload image

    private insertDOM(htmlContainer: HTMLElement) {
        htmlContainer.innerHTML=`
            <div class="igraph-modal">
                <div class="igraph-modal-wrapper">
                    <div class="igraph-modal-close">
                        <span class="fa fa-times fa-lg"></span>
                    </div>
                    <div class="igraph-modal-main">
                        <div class="mt-tabpage" js-tab="2">
                            <div class="mt-tabpage-title">
                                <a href="javascript:;" class="mt-tabpage-item mt-tabpage-item-cur">Local image</a>
                                <a href="javascript:;" class="mt-tabpage-item">Internet Image</a>
                                <a href="javascript:;" class="mt-tabpage-item">Take a picture</a>
                            </div>
                            <div class="mt-tabpage-count">
                                <ul class="mt-tabpage-cont__wrap">
                                    <li class="mt-tabpage-content mt-tabpage-content-cur">
                                        <div class="igraph-uploader">
                                            <div class="igraph-uploader-wrapper">
                                                <img src="" alt="" class="igraph-uploader-img">
                                                <div class="igraph-filebox">
                                                    <span>Drag Or Choose</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="inputCtrl">
                                            <button class="igraph-button igraph-upload" >Upload</button>
                                            <button class="igraph-button is-danger igraph-uploader-delete" >Delete</button>
                                        </div>
                                    </li>
                                    <li class="mt-tabpage-content">
                                        <div class="inputCtrl">
                                            <img src="https://grapheco.github.io/InteractiveGraph/dist/examples/images/photo/%E8%B4%BE%E5%AE%9D%E7%8E%89.jpg" alt="" class="igraph-url-img">
                                        </div>
                                        <form action="#">
                                            <div class="inputCtrl">

                                                <span class="igraph-input-label">URL:</span>
                                                <input type="text" class="igraph-input url" value="https://grapheco.github.io/InteractiveGraph/dist/examples/images/photo/%E8%B4%BE%E5%AE%9D%E7%8E%89.jpg" placeholder="Please input the picture path">
                                            </div>
                                        </form>
                                        <div class="inputCtrl">
                                            <button class="igraph-button igraph-upload" >Upload</button>
                                            <button class="igraph-button is-danger igraph-uploader-delete" >Delete</button>
                                        </div>
                                    </li>
                                    <li class="mt-tabpage-content">
                                        <div class="igraph-cam">
                                            <video class="igraph-cam-video" ></video>
                                            <canvas class="igraph-cam-canvas" style="display:none;"></canvas>
                                            <img src="" alt="" class="igraph-cam-image">
                                        </div>
                                        <div class="inputCtrl">
                                            <button class="igraph-button igraph-take" >Take</button>
                                            <button class="igraph-button igraph-upload" >Upload</button>
                                            <button class="igraph-button is-danger igraph-uploader-delete" >Delete</button>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
}

class Uploader{

    private _html:JQuery<HTMLElement> = null;
    private _fileInput = null;
    private _maxSize = 2000;//KB
    private _file = null;

    constructor(html:JQuery<HTMLElement>){
        this._html = html;
        this.init();
    }

    init(){
        // this._html.append(this._fileupload);
        this.eventClickInit();

    }

    static onDragover(e){
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    onDrop(e){
        e.stopPropagation();
        e.preventDefault();
        if (this._file)
            return false;
        var fileList = e.dataTransfer.files; //获取文件对象
        // do something upload
        if(fileList.length == 0){
            return false;
        }
        //检测文件是不是图片
        if(fileList[0].type.indexOf('image') === -1){
            alert("您拖的不是图片！");
            return false;
        }

        //拖拉图片到浏览器，可以实现预览功能
        var img = window.URL.createObjectURL(fileList[0]);
        var filename = fileList[0].name; //图片名称
        var filesize = Math.floor((fileList[0].size)/1024);
        if(filesize > this._maxSize){
            alert("上传大小不能超过"+this._maxSize+"KB.");
            return false;
        }

        this.preview(img,name);
        this._file = fileList;
    }
    eventClickInit(){
        var self = this;
        this._html.unbind().click(function () {
            self.createImageUploadDialog();
        })
        var dp = this._html[0];
        dp.addEventListener('dragover', function(e) {
            Uploader.onDragover(e);
        });
        dp.addEventListener("drop", function(e) {
            self.onDrop(e);
        });


    }
    onChangeUploadFile(){
        var fileInput = this._fileInput;
        var files = fileInput.files;
        var file = files[0];
        var img = window.URL.createObjectURL(file);
        var filename = file.name;
        this.preview(img,name);
        this._file = files;
    }
    createImageUploadDialog(){
        var fileInput = this._fileInput;
        if (!fileInput) {
            //创建临时input元素
            fileInput = document.createElement('input');
            //设置input type为文件类型
            fileInput.type = 'file';
            //设置文件name
            fileInput.name = 'ime-images';
            //允许上传多个文件
            fileInput.multiple = false;
            fileInput.accept = 'image/*';
            fileInput.onchange  = this.onChangeUploadFile.bind(this);
            this._fileInput = fileInput;
        }
        if (this._file)
            return false;
        //触发点击input点击事件，弹出选择文件对话框
        fileInput.click();
    }

    preview(src:string, name:string){
        this._html.find(".igraph-uploader-img").attr("src",src);
        this._html.find(".igraph-uploader-img").attr("title",name);
        this._html.find(".igraph-uploader-img").show();
        this._html.find(".igraph-filebox").hide()
    }

    cleanFile(){
        console.log('clean');
        this._file = null;
        this._fileInput.value="";
        this._html.find(".igraph-uploader-img").hide();
        this._html.find(".igraph-filebox").show();
    }


    get file(): any {
        return this._file;
    }
}

class Camera {

    private _html:JQuery<HTMLElement> = null;
    private _video:JQuery<HTMLElement> = null;
    private _canvas:JQuery<HTMLElement> = null;
    private _img:JQuery<HTMLElement> = null;
    private _opening:boolean = false;
    private _stream = null;
    private _photo = null;

    constructor(html:JQuery<HTMLElement>){
        this._html = html;
        this._video = this._html.find(".igraph-cam-video");
        this._canvas = html.find(".igraph-cam-canvas");
        this._img = html.find(".igraph-cam-image");

    }


    get photo(): any {
        return this._photo;
    }

    get opening(): boolean {
        return this._opening;
    }

    public initCam():boolean{
        // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
        if (navigator.mediaDevices === undefined) {
            return false;
        }
        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function (constraints) {
                // 首先，如果有getUserMedia的话，就获得它
                var getUserMedia = navigator['webkitGetUserMedia'] || navigator['mozGetUserMedia'] || navigator['msGetUserMedia']

                // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }

                // 否则，为老的navigator.getUserMedia方法包裹一个Promise
                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }
        const constraints = {
            video: true,
            audio: false
        };
        let videoPlaying = false;
        let v = this._video.get(0);

        let promise = navigator.mediaDevices.getUserMedia(constraints);
        promise.then(stream => {
            this._stream = stream;
            // 旧的浏览器可能没有srcObject
            if ("srcObject" in v) {
                v['srcObject'] = stream;
            } else {
                // 防止再新的浏览器里使用它，应为它已经不再支持了
                v['src'] = window.URL.createObjectURL(stream);
            }
            v.onloadedmetadata = function (e) {
                v['play']();
                videoPlaying = true;
            };

        }).catch(err => {
            console.error(err.name + ": " + err.message);
            return false
        })
        console.log("cam opened");
        this._opening = true;
        return true;
    }

    public closeCam(){
        console.log("close cam");
        this._stream.getTracks().forEach(function (track) {
            track.stop();
        });
        this._opening = false;
    }

    public takePhoto(){
        console.log('take photo');
        if (this._opening) {
            let canvas = this._canvas.get(0);
            canvas['width'] = this._video.get(0)['videoWidth'];
            canvas['height'] = this._video.get(0)['videoHeight'];
            canvas['getContext']('2d').drawImage(this._video.get(0), 0, 0);
            let data = canvas['toDataURL']('image/webp');
            this._img.attr('src', data);
            this._img.show();
            this._video.hide();
            this.closeCam();
            this._photo = this.dataURLtoFile(data);
        }
    }

    public reTake(){
        this._img.hide();
        this._photo = null;
        this._video.show();
        this.initCam();
    }

    private dataURLtoFile(dataurl:string, filename = 'file'){
        let arr = dataurl.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let suffix = mime.split('/')[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], `${filename}.${suffix}`, {type: mime})
    }



}
