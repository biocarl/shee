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

  public showMenu = false;
  public menuPosition = {top: 0, left: 0};
  public selectedObject: fabric.Object | fabric.Group | null = null;

  constructor(private renderer: Renderer2) {
    this.disableScrollbar();
  }

  private disableScrollbar() {
    this.renderer.addClass(document.getElementsByTagName('html')[0], 'is-clipped');
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
    this.canvas.on('selection:created', this.onObjectSelected.bind(this));
    this.canvas.on('selection:cleared', this.onObjectDeselected.bind(this));
    // this.canvas.on('object:moving', this.onObjectMoving.bind(this));
    //
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

  onObjectSelected() {
    const object = this.canvas.getActiveObject();
    let zoom = this.canvas.getZoom();
    if (object) {
      let objectCenter = object.getCenterPoint();

      let boundingRect = object.getBoundingRect();
      let objectHeight = boundingRect.height * zoom;


      let absCoords = {
        // @ts-ignore
        left: objectCenter.x * zoom + (this.canvas.viewportTransform![4] + document.getElementById('menu').offsetWidth / 2),
        top: objectCenter.y * zoom - objectHeight/2 + this.canvas.viewportTransform![5] + 40
      };


      this.showMenu = true;
      this.selectedObject = object;
      // @ts-ignore
      let menu = document.getElementById('menu'), menuWidth = document.getElementById('menu').offsetWidth,        menuHeight = document.getElementById('menu').offsetHeight;
      menu!.style.left = (absCoords.left - menuWidth) + 'px';
      menu!.style.top = (absCoords.top - menuHeight) + 'px';
    }
  }

  onObjectDeselected(event: fabric.IEvent) {
    this.showMenu = false;
    this.selectedObject = null;
  }

  // onObjectMoving() {
  //   const object = this.canvas.getActiveObject();
  //
  //   if (object) {
  //     // calculate the position in viewport coordinates
  //     const zoom = this.canvas.getZoom();
  //     const pan = this.canvas.viewportTransform;
  //     const objectCenter = object.getCenterPoint();
  //     if (pan) {
  //       // @ts-ignore
  //       const xPos = objectCenter.x * zoom + pan[4] - document.getElementById("menu").offsetWidth / 2;
  //       const yPos = objectCenter.y * zoom + pan[5] - document.getElementById("menu").offsetHeight - 100;
  //       this.menuPosition = {
  //         top: yPos,
  //         left: xPos,
  //       };
  //     }
  //   }
  // }


  changeColor(event: MouseEvent) {
    const element = event.target as HTMLElement;
    const colorSpans = document.querySelectorAll('.color-selection span') as NodeListOf<HTMLElement>;

    // Loop over all color spans to remove the 'active' class from their classList
    colorSpans.forEach(span => {
      if (span !== element) {
        span.classList.remove('active');
      }
    });

    // Add the 'active' class to the clicked element's classList
    element.classList.add('active');
    let bgColor = getComputedStyle(element).getPropertyValue('background-color');
    // @ts-ignore
    this.stickyNote.setBackgroundColor(this.selectedObject, bgColor);
    this.canvas.renderAll();
  }


  private initializeCanvas() {
    this.canvas = new fabric.Canvas('canvas', {
      backgroundColor: 'transparent',
    });
    this.canvas.setWidth(window.innerWidth);
    let navbarHeight = document.getElementById("navbar")!.offsetHeight;
    let buttonHeight = document.getElementById("buttons")!.offsetHeight;
    console.log("navbarHeight = " + navbarHeight + " - ButtonHeight: " + buttonHeight);
    this.canvas.setHeight(window.innerHeight - (navbarHeight + buttonHeight));
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
    this.canvas.setHeight(window.innerHeight - (document.getElementById("navbar")!.offsetHeight + document.getElementById("buttons")!.offsetHeight));
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
