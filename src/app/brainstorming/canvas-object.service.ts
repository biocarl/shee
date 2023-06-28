import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CanvasObjectService {
public objectAdded = new EventEmitter<{ text: string; color: string; hasVisibleContent: boolean; type: string; }>();
public toggleTextVisibility = new EventEmitter<{ textVisible: boolean; }>();
  constructor() {}
}
