import {fabric} from "fabric";

export interface CanvasObject<T> {
   create():fabric.Object;
   setBackgroundColor(object: T,color: string):void;
}
