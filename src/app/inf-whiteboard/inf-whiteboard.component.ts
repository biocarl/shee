import {Component, HostListener, OnInit, Renderer2} from '@angular/core';
import {fabric} from 'fabric';

@Component({
  selector: 'app-inf-whiteboard',
  templateUrl: './inf-whiteboard.component.html',
  styleUrls: ['./inf-whiteboard.component.css']
})
export class InfWhiteboardComponent implements OnInit {
  private canvas!: fabric.Canvas;
  private canBePanned = false;
  private lastPosX: number = 0;
  private lastPosY: number = 0;
  private isDragging: boolean = false;

  constructor(private renderer: Renderer2) {
    this.renderer.addClass(document.body, 'is-clipped');
  }

  ngOnInit(): void {
    this.canvas = new fabric.Canvas('canvas', {
      backgroundColor: 'rgb(0,0,0,0)',
    });
    this.canvas.setWidth(window.innerWidth);
    this.canvas.setHeight(window.innerHeight);

    this.canvas.on('mouse:dblclick', (options) => {
      let target = options.target as fabric.Group;
      if (target && target.type === 'group') {
        let items = target.getObjects();
        let textbox = items.find((obj) => obj.type === 'textbox') as fabric.Textbox;
        if (textbox) {
          target.removeWithUpdate(textbox);
          this.canvas.add(textbox);
          this.canvas.setActiveObject(textbox);
          textbox.enterEditing();
          items.forEach((item) => {
            if (item !== textbox) {
              item.set({selectable: false});
            }
          });
        }
      }
    });

    this.canvas.on('mouse:wheel', (opt: fabric.IEvent<WheelEvent>) => {
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
    });

    this.canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      if (this.canBePanned) {
        // this.canvas.defaultCursor = 'grabbing';
        this.isDragging = true;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });

    this.canvas.on('mouse:move', (opt) => {
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
    });
    this.canvas.on('mouse:up', () => {
      if (this.isDragging) {
        // @ts-ignore
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.isDragging = false;
        // this.canvas.defaultCursor = 'default            ';
      }
    });
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
    }if (event.key === 'Delete') {
      this.deleteSticky();
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

  addStickyNote(stickyText?: string) {
    const stickyHeight = 200;
    const stickyWidth = 200;

    let shadow = new fabric.Shadow({
      color: 'rgb(0,0,0,0.5)',
      blur: 7,
      offsetX: 1,
      offsetY: 1,
    });

    let rectangle = new fabric.Rect({
      left: 0,
      top: 0,
      width: stickyWidth,
      height: stickyHeight,
      fill: 'yellow',
      shadow: shadow,
    });

    let textbox = new fabric.Textbox('', {
      hasBorders: false,
      textAlign: "center",
      left: 10,  // Start from the padding size
      top: 10,   // Start from the padding size
      fontSize: 21,
      width: 180,  // Rectangle's width (200) - 2 * padding size (10)
      fill: 'black',
      //@ts-ignore
      fixedHeight: 180,
      fixedWidth: 180,
      objectCaching: false
    });

    textbox.on('changed', () => {
      this.adjustFontSize(textbox, stickyHeight);
    });

    textbox.on('editing:exited', () => {
      // Re-add the textbox to the group after editing is finished.
      sticky.addWithUpdate(textbox);
      this.canvas.remove(textbox);

      // Deselect group
      this.canvas.discardActiveObject();
      this.canvas.renderAll();

      // Make items selectable again
      sticky.getObjects().forEach(item => item.set('selectable', true));
    });

    let sticky = new fabric.Group([rectangle, textbox], {});

    sticky.setControlsVisibility({
      mb: false,
      ml: false,
      mr: false,
      mt: false
    });

    sticky.set({
      borderColor: 'white',
      cornerStrokeColor: 'white',
      lockScalingFlip:true
    })

    this.canvas.add(sticky);
    sticky.viewportCenter();
    if(stickyText){
      textbox.set({
        text: stickyText,
      })
      this.adjustFontSize(textbox,stickyHeight);
    }
  }

  private adjustFontSize(textbox: fabric.Textbox, stickyHeight: number) {
    //@ts-ignore
    while (textbox.height < stickyHeight - 20 && textbox.fontSize <= 200) {
      // @ts-ignore
      textbox.fontSize++;
      this.canvas.renderAll();
    }
    //@ts-ignore
    while (textbox.height > stickyHeight - 20 && textbox.fontSize >= 1) {
      // @ts-ignore
      textbox.fontSize--;
      this.canvas.renderAll();
    }

    // @ts-ignore
    if (textbox.width > textbox.fixedWidth) {
      // @ts-ignore
      textbox.fontSize *= textbox.fixedWidth / (textbox.width + 1);
      // @ts-ignore
      textbox.width = textbox.fixedWidth;
    }
    this.canvas.renderAll();
    console.log("Fontsize: " + textbox.fontSize);
  }

  private deleteSticky() {
    const activeObjects = this.canvas.getActiveObjects();

    if (activeObjects && activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        if (obj.type === 'group') {
          const stickyGroup = obj as fabric.Group;
          this.canvas.remove(stickyGroup);
        }
      });

      this.canvas.discardActiveObject();
      this.canvas.renderAll();
    }
  }
}
