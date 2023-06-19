import {fabric} from "fabric";

export abstract class CanvasObject<T> {
  public abstract create():fabric.Object;
  protected abstract attachDoubleClickHandler(object: T):void;
}
