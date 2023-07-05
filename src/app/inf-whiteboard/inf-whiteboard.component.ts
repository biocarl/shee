import {Component, HostListener, OnInit, Renderer2} from '@angular/core';
import {fabric} from 'fabric';
import {StickyNoteFactory} from "./canvas-objects/sticky-note-factory";
import {LoggerService} from "../logger.service";
import {CanvasObjectService} from "../brainstorming/canvas-object.service";
import {FixedSizeTextbox} from "./canvas-objects/fixed-size-textbox";

@Component({
  selector: 'app-inf-whiteboard',
  templateUrl: './inf-whiteboard.component.html',
  styleUrls: ['./inf-whiteboard.component.css']
})
export class InfWhiteboardComponent implements OnInit {
  private canvas!: fabric.Canvas;
  private stickyNoteFactory?: StickyNoteFactory;
  private canBePanned = false;
  private lastPosX: number = 0;
  private lastPosY: number = 0;
  private isDragging: boolean = false;
  private objectIsMoving: boolean = false;
  private objectIsRotating: boolean = false;
  private groupCounter: number = 0;
  private bufferedObjects: { text: string; color: string; hasVisibleContent: boolean; type: string }[] = [];

  public showMenu = false;
  public menuPosition = {top: 0, left: 0};
  public selectedObject: fabric.Object | fabric.Group | undefined = undefined;

  constructor(private renderer: Renderer2, private log: LoggerService, private canObjSer: CanvasObjectService) {
    this.disableScrollbar();
    this.canObjSer.objectAdded.subscribe((object: {
      text: string;
      color: string;
      hasVisibleContent: boolean;
      type: string
    }) => {
      if (object.type === "stickyNote") {
        if (this.stickyNoteFactory) {
          this.addStickyNote(object.hasVisibleContent, object.text, object.color);
        } else {
          this.bufferedObjects.push(object);
        }
      }
    })
    this.canObjSer.toggleTextVisibility.subscribe((object: { textVisible: boolean }) => {
      this.toggleTextVisibility(object.textVisible);
    })
    this.canObjSer.requestCanvas.subscribe(() => {
      console.log("requestCanvas received");
      this.canObjSer.sendCanvas.emit({canvas: this.canvas});
    })
  }

  private disableScrollbar() {
    this.renderer.addClass(document.getElementsByTagName('html')[0], 'is-clipped');
    this.renderer.setStyle(document.getElementsByClassName('footerShee')[0], "display", "none");
  }

  ngOnInit(): void {
    this.initializeCanvas();
    this.setCanvasEventListeners();
    this.stickyNoteFactory = new StickyNoteFactory(this.canvas);
    this.bufferedObjects.forEach(object => {
      this.addStickyNote(true, object.text, object.color);
    });
    console.log(this.canvas.getObjects());
    this.bufferedObjects = [];
  }

  private setCanvasEventListeners() {
    this.canvas.on('mouse:wheel', this.handleMouseWheel.bind(this));
    this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
    this.canvas.on('mouse:up', this.handleMouseUp.bind(this));
    this.canvas.on('mouse:move', this.handleMouseMove.bind(this));
    this.canvas.on('selection:created', this.onObjectSelected.bind(this));
    this.canvas.on('selection:updated', this.onObjectSelectedUpdated.bind(this));
    this.canvas.on('selection:cleared', this.onObjectDeselected.bind(this));
    this.canvas.on('object:moving', this.onObjectMoving.bind(this));
    this.canvas.on('object:scaling', this.onObjectScaling.bind(this));
    this.canvas.on('object:rotating', this.onObjectRotating.bind(this));
  }

  private handleMouseUp() {
    if (this.isDragging) {
      // @ts-ignore
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.isDragging = false;
      // this.canvas.defaultCursor = 'default            ';
    }

    if (this.objectIsMoving) {
      this.objectIsMoving = false;
      this.placeMenu();
    }

    if (this.objectIsRotating) {
      this.objectIsRotating = false;
      this.placeMenu();
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
    const delta = opt.e.deltaY;
    let zoom = this.canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    this.canvas.zoomToPoint({x: opt.e.offsetX, y: opt.e.offsetY}, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
    if (this.selectedObject) {
      this.placeMenu();
    }
  };

  onObjectSelected(event: fabric.IEvent) {
    if (event.selected) {
      event.selected.forEach(obj => {
        if (obj.type === 'group') {
          this.groupCounter++;
        }
      });
    }
    this.selectedObject = event.selected && event.selected[0];
    this.placeMenu();
  }

  onObjectSelectedUpdated(event: fabric.IEvent) {
    this.groupCounter = 0;
    if (event.selected) {
      event.selected.forEach(obj => {
        if (obj.type === 'group') {
          this.groupCounter++;
        }
      });
    }
    this.selectedObject = event.selected && event.selected[0];
    this.placeMenu();
  }

  onObjectRotating() {
    this.objectIsRotating = true;
    this.showMenu = false;
  }

  private placeMenu() {
    if (this.groupCounter === 1) {
      const object = this.canvas.getActiveObject();
      if (object) {
        const menu = document.getElementById('menu')!;
        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;

        //@ts-ignore
        this.updateActiveColor(object);

        // Get the bounding rectangle of the object, taking into account viewporttransform.
        const boundingRect = object.getBoundingRect(undefined, true);

        //TODO: remove magic numbers 180 and 250 and replace with dynamic calculation of menu width
        const menuTop = (boundingRect.top - menuHeight + 180);
        const menuLeft = boundingRect.left + (boundingRect.width / 2) - ((menuWidth + 250) / 2);

        this.showMenu = true;
        menu.style.left = menuLeft + 'px';
        menu.style.top = menuTop + 'px';
      }
    }
  }

  onObjectDeselected(event: fabric.IEvent) {
    if (event.deselected) {
      event.deselected.forEach(obj => {
        if (obj.type === 'group') {
          this.groupCounter--;
        }
      });
    }
    this.showMenu = false;
    this.selectedObject = undefined;
  }

  onObjectMoving() {
    this.showMenu = false;
    this.objectIsMoving = true;
  }

  onObjectScaling() {
    this.placeMenu();
  }

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
    this.stickyNoteFactory.setBackgroundColor(this.selectedObject, bgColor);
    this.canvas.renderAll();
  }

  private updateActiveColor(object: fabric.Group | fabric.Object | undefined) {
    if (object) {
      let objectWithColor = object;
      // rectangle is the first object in the group
      if ("item" in object) {
        objectWithColor = object.item(0) as fabric.Rect;
      }
      const backgroundColor = objectWithColor.fill;

      const colorSpans = document.querySelectorAll('.color-selection span') as NodeListOf<HTMLElement>;

      // Loop over all color spans to remove the 'active' class from their classList
      colorSpans.forEach(span => {
        span.classList.remove('active');

        // Check if span's background color matches sticky note's color
        const spanColor = getComputedStyle(span).getPropertyValue('background-color');
        if (spanColor === backgroundColor) {
          span.classList.add('active');
        }
      });
    }
  }

  private initializeCanvas() {
    this.canvas = new fabric.Canvas('canvas', {
      backgroundColor: 'transparent',
    });
    this.canvas.setWidth(window.innerWidth);
    //TODO hardcoded height may change depending on DOM
    let navbarHeight = document.getElementById("navbar")!.offsetHeight;
    this.canvas.setHeight(window.innerHeight - (navbarHeight));
  }

  @HostListener('document:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    this.log.logToConsole(event.key);
    if (event.key === ' ') {
      this.canBePanned = true;
    }
    if (event.key === 'Delete') {
      this.deleteObjects();
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === ' ') {
      this.canBePanned = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.canvas.setWidth(window.innerWidth);
    this.canvas.setHeight(window.innerHeight - (document.getElementById("navbar")!.offsetHeight));
  }

  addStickyNote(textVisible: boolean = false, stickyText?: string, color?: string) {
    if (this.stickyNoteFactory) {
      this.stickyNoteFactory.create(textVisible, stickyText, color);
    }
  }

  private deleteObjects() {
    const activeObjects = this.canvas.getActiveObjects();

    if (activeObjects && activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        //TODO implement logic to delete fabricObjects without breaking delete functionality while typing
        if (obj.type === 'group') {
          const stickyGroup = obj as fabric.Group;
          this.canvas.remove(stickyGroup);
          this.canvas.discardActiveObject();
          this.canvas.renderAll();
        }
      });
    }
  }

  public toggleTextVisibility(textVisible: boolean): void {
    this.canvas.getObjects().forEach(obj => {
      if (obj.type === 'group') {
        let group = obj as fabric.Group;

        group.getObjects().forEach(groupItem => {
          console.log("Textbox?", groupItem);

          if (groupItem instanceof FixedSizeTextbox) {
            groupItem.fill = textVisible ? 'rgb(0,0,0,0.87)' : 'transparent';
            groupItem.textVisible = textVisible;
          }

          if (groupItem.name === "hiddenSVG") {
            groupItem.visible = !textVisible;
          }
        });
      }
    });
    this.canvas.renderAll();
  }

  toJohnson() {
    console.log(JSON.stringify(this.canvas));
    console.log(JSON.parse(JSON.stringify(this.canvas)));
  }


}
