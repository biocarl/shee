import {Component, HostListener, OnInit, Renderer2} from '@angular/core';
import {fabric} from 'fabric';
import {StickyNote} from "./canvas-objects/sticky-note";

@Component({
  selector: 'app-inf-whiteboard',
  templateUrl: './inf-whiteboard.component.html',
  styleUrls: ['./inf-whiteboard.component.css']
})
export class InfWhiteboardComponent implements OnInit {
  private canvas!: fabric.Canvas;
  private stickyNote!: StickyNote;
  private canBePanned = false;
  private lastPosX: number = 0;
  private lastPosY: number = 0;
  private isDragging: boolean = false;

  constructor(private renderer: Renderer2) {
    this.disableScrollbar();
  }

  private disableScrollbar() {
    this.renderer.addClass(document.body, 'is-clipped');
  }

  ngOnInit(): void {
    this.initializeCanvas();
    this.setCanvasEventListeners();
    this.stickyNote = new StickyNote(this.canvas);
  }

  private setCanvasEventListeners() {
    this.canvas.on('mouse:wheel', this.handleMouseWheel.bind(this));
    this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
    this.canvas.on('mouse:up', this.handleMouseUp.bind(this));
    this.canvas.on('mouse:move', this.handleMouseMove.bind(this));
  }

  private handleMouseUp() {
    if (this.isDragging) {
      // @ts-ignore
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.isDragging = false;
      // this.canvas.defaultCursor = 'default            ';
    }
  };


  private handleMouseMove(opt: fabric.IEvent<MouseEvent>) {
    if (this.isDragging) {
      // this.canvas.defaultCursor = 'grabbing';
      const e = opt.e;
      const vpt = this.canvas.viewportTransform;
      if (vpt) {
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
      }
      this.canvas.requestRenderAll();
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
  };


  private handleMouseDown(opt: fabric.IEvent<MouseEvent>) {
    const evt = opt.e;
    if (this.canBePanned) {
      // this.canvas.defaultCursor = 'grabbing';
      this.isDragging = true;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    }
  };

  private handleMouseWheel(opt: fabric.IEvent<WheelEvent>) {
    const evt = opt.e;
    if (evt.ctrlKey) {
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      this.canvas.zoomToPoint({x: opt.e.offsetX, y: opt.e.offsetY}, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    }
  };

  private initializeCanvas() {
    this.canvas = new fabric.Canvas('canvas', {
      backgroundColor: 'transparent',
    });
    this.canvas.setWidth(window.innerWidth);
    this.canvas.setHeight(window.innerHeight);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    console.log(event.key);
    if (event.key === ' ') {
      // event.preventDefault();
      this.canBePanned = true;
      // this.canvas.defaultCursor = 'grab';
    }
    if (event.ctrlKey) {

      // this.canvas.defaultCursor = 'zoom-in';
    }
    if (event.key === 'Delete') {
      this.deleteObjects();
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
      this.canBePanned = false;
      // this.canvas.defaultCursor = 'default';
    }
    // if (event.ctrlKey) {
    //   event.preventDefault();
    //   this.canBePanned = false;
    //   this.canvas.defaultCursor = 'default';
    // }
  }

  @HostListener('window:resize')
  onResize() {
    this.canvas.setWidth(window.innerWidth);
    this.canvas.setHeight(window.innerHeight);
  }

  addStickyNote(stickyText?: string) {
    let newSticky = this.stickyNote.create(stickyText);

    this.canvas.add(newSticky);
    newSticky.viewportCenter();
  }


  private deleteObjects() {
    const activeObjects = this.canvas.getActiveObjects();

    if (activeObjects && activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        if (obj.type === 'group') {
          const stickyGroup = obj as fabric.Group;
          this.canvas.remove(stickyGroup);
          this.canvas.discardActiveObject();
          this.canvas.renderAll();
        }
      });
    }
  }
}
