import {fabric} from "fabric";

export abstract class CanvasObject<T> {
  public abstract create():fabric.Object;
  public abstract setBackgroundColor(object: T,color: string):void;
  protected abstract attachDoubleClickHandler(object: T):void;
}
