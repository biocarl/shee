import {EventEmitter, Injectable} from '@angular/core';
import {fabric} from "fabric";

@Injectable({
  providedIn: 'root'
})
export class CanvasObjectService {
public objectAdded = new EventEmitter<{ text: string; color: string; hasVisibleContent: boolean; type: string; }>();
public toggleTextVisibility = new EventEmitter<{ textVisible: boolean; }>();
public requestCanvas = new EventEmitter();
public sendCanvas = new EventEmitter<{canvas: fabric.Canvas;}>;
  constructor() {}
}
