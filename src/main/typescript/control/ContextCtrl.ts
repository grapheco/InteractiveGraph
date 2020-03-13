import {BGControl, UIControl} from "./control";
import {EVENT_ARGS_FRAME, FrameEventName} from "../types";
/**
 * ContextCtrl
 * ContextCtrl control the show/hide
 * of context when node or background be right click
 * */
export class ContextCtrl extends BGControl {
    private _frame;

    private _targetNodeId: string;

    private _menu: any;

    getTypeName(): string {
        return "ContextCtrl";
    }

    onCreate(args: EVENT_ARGS_FRAME) {

        this._frame = args.mainFrame;
        this._menu = [
            { title: 'Pin', icon: 'fa fa-map-pin', fn: ()=>{this.pinHandler() } },
            { title: 'Highlight', icon: 'fa fa-sun-o', fn: ()=>{this.hlHandler() } },
            { title: 'Extend', icon: 'fa fa-expand', fn: ()=>{this.extHandler() } },
            { title: 'Add', icon: 'fa fa-plus', fn: ()=>{this.addHandler() } },
            { },
            { title: 'Delete', icon: 'fa fa-trash-o', fn: ()=>{this.delHandler() } }
        ];
        this._frame.on(FrameEventName.NETWORK_ONCONTEXT, (e)=>{

            let node = this._frame._network.getNodeAt(e.pointer.DOM);

            if (node) {
                this._targetNodeId = node;
                Context.show(this._menu, e.event);
            } else {
                Context.close();
                // Do not trigger default event or further propagation
                if (typeof e.preventDefault === 'function')  e.preventDefault()
                if (typeof e.stopPropagation === 'function') e.stopPropagation()
            }

        })

    }

    onDestroy(args: EVENT_ARGS_FRAME) {

    }

    private pinHandler() {
        //TODO pin the node
    }

    private hlHandler() {
        this._frame.highlightNodes([this._targetNodeId])
    }

    private extHandler() {
        //TODO extend
    }

    private addHandler() {
        this._frame.emit(FrameEventName.RESULTLISTPUT, [this._targetNodeId]);
    }

    private delHandler() {

    }
}

export class Context {

    private static overflow  = null;

    private static ITEM      = 'item';
    private static SEPARATOR = 'separator';

    static dom (elem = ''):any {

        return document.querySelector('.basicContext ' + elem)

    }

    static valid (item:any) {

        let emptyItem = (Object.keys(item).length === 0);

        if (emptyItem===true)     item.type    = this.SEPARATOR;
        if (item.type==null)      item.type    = this.ITEM;
        if (item.class==null)     item.class   = '';
        if (item.visible!==false) item.visible = true;
        if (item.icon==null)      item.icon    = null;
        if (item.title==null)     item.title   = 'Undefined';

        // Add disabled class when item disabled
        if (item.disabled!==true) item.disabled = false;
        if (item.disabled===true) item.class += ' basicContext__item--disabled';

        // Item requires a function when
        // it's not a separator and not disabled
        if (item.fn==null && item.type!==this.SEPARATOR && item.disabled===false) {

            console.warn(`Missing fn for item '${ item.title }'`);
            return false

        }

        return true

    }

    static buildItem(item:any, num:number) {

        let html = '',
            span = '';

        // Parse and validate item
        if (this.valid(item)===false) return '';

        // Skip when invisible
        if (item.visible===false) return '';

        // Give item a unique number
        item.num = num;

        // Generate span/icon-element
        if (item.icon!==null) span = `<span class='basicContext__icon ${ item.icon }'></span>`;

        // Generate item
        if (item.type===this.ITEM) {

            html = `
		       <tr class='basicContext__item ${ item.class }'>
		           <td class='basicContext__data' data-num='${ item.num }'>${ span }${ item.title }</td>
		       </tr>
		       `

        } else if (item.type===this.SEPARATOR) {

            html = `
		       <tr class='basicContext__item basicContext__item--separator'></tr>
		       `

        }

        return html

    }

    static build (items) {

        let html = '';

        html += `
	            <div class='basicContext'>
	                <table>
	                    <tbody>
	        `;

        items.forEach((item, i) => html += this.buildItem(item, i));

        html += `
	                    </tbody>
	                </table>
	            </div>
	        `

        return html

    }

    static getNormalizedEvent(e:any) {

        let pos = {
            x : e.clientX,
            y : e.clientY
        };

        if (e.type==='touchend' && (pos.x==null || pos.y==null)) {

            // We need to capture clientX and clientY from original event
            // when the event 'touchend' does not return the touch position

            let touches = e.changedTouches;

            if (touches!=null&&touches.length>0) {
                pos.x = touches[0].clientX;
                pos.y = touches[0].clientY
            }

        }

        // Position unknown
        if (pos.x==null || pos.x < 0) pos.x = 0;
        if (pos.y==null || pos.y < 0) pos.y = 0;

        return pos

    }

    static getPosition (e, context) {

        // Get the click position
        let normalizedEvent = this.getNormalizedEvent(e);

        // Set the initial position
        let x = normalizedEvent.x,
            y = normalizedEvent.y;

        // Get size of browser
        let browserSize = {
            width  : window.innerWidth,
            height : window.innerHeight
        }

        // Get size of context
        let contextSize = {
            width  : context.offsetWidth,
            height : context.offsetHeight
        }

        // Fix position based on context and browser size
        if ((x + contextSize.width) > browserSize.width)   x = x - ((x + contextSize.width) - browserSize.width)
        if ((y + contextSize.height) > browserSize.height) y = y - ((y + contextSize.height) - browserSize.height)

        // Make context scrollable and start at the top of the browser
        // when context is higher than the browser
        if (contextSize.height > browserSize.height) {
            y = 0
            context.classList.add('basicContext--scrollable')
        }

        // Calculate the relative position of the mouse to the context
        let rx = normalizedEvent.x - x,
            ry = normalizedEvent.y - y

        return { x, y, rx, ry }

    }

    static bind (item:any) {

        if (item.fn==null)        return false;
        if (item.visible===false) return false;
        if (item.disabled===true) return false;


        Context.dom(`td[data-num='${ item.num }']`).onclick       = item.fn;
        Context.dom(`td[data-num='${ item.num }']`).oncontextmenu = item.fn;

        return true

    }

    public static show (items, e, fnClose?, fnCallback?) {

        // Cache the context
        let context = this.dom()

        if (context == null || context.length == 0) {
            // Build context
            let html = this.build(items);

            // Add context to the body
            document.querySelector("#graphArea").insertAdjacentHTML('beforeend', html);

            // Cache the context
            context = this.dom()
        }

        // Save current overflow and block scrolling of site
        if (this.overflow==null) {
            this.overflow = document.body.style.overflow
            document.body.style.overflow = 'hidden'
        }


        // Calculate position
        let position = this.getPosition(e, context)

        // Set position
        context.style.left            = `${ position.x }px`
        context.style.top             = `${ position.y }px`
        context.style.transformOrigin = `${ position.rx }px ${ position.ry }px`
        context.style.opacity         = 1

        // Close fn fallback
        if (fnClose==null) fnClose = Context.close

        // Bind click on background
        context.parentElement.onclick       = fnClose
        context.parentElement.oncontextmenu = fnClose

        // Bind click on items
        items.forEach(this.bind)

        // Do not trigger default event or further propagation
        if (typeof e.preventDefault === 'function')  e.preventDefault()
        if (typeof e.stopPropagation === 'function') e.stopPropagation()

        // Call callback when a function
        if (typeof fnCallback === 'function') fnCallback()

        return true

    }

    public static visible () {

        let elem = Context.dom();

        if (elem==null || elem.length===0) return false;
        else                               return true

    }

    public static close () {

        if (Context.visible()===false) return false

        let container = document.querySelector('.basicContext')

        container.parentElement.removeChild(container)

        // Reset overflow to its original value
        if (this.overflow!=null) {
            document.body.style.overflow = this.overflow
            this.overflow = null
        }

        return true

    }
}