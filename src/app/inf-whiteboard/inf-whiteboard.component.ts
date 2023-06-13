import {AfterViewInit, Component, HostListener} from '@angular/core';
import {fabric} from 'fabric';


@Component({
  selector: 'app-inf-whiteboard',
  templateUrl: './inf-whiteboard.component.html',
  styleUrls: ['./inf-whiteboard.component.css']
})
export class InfWhiteboardComponent implements AfterViewInit {
  private canvas!: fabric.Canvas;
  private isDragging: boolean = false;
  private lastPosX: number = 0;
  private lastPosY: number = 0;
  private selection: boolean = true;



  ngAfterViewInit() {
    this.canvas = new fabric.Canvas('canvas', {
      selection: false,
      hoverCursor: 'default',
      backgroundColor: 'lightgray'
    });

    this.canvas.setWidth(window.innerWidth);
    this.canvas.setHeight(window.innerHeight-220);
    this.canvas.renderAll();

    this.canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    this.canvas.on('mouse:down', (opt) => {
      var evt = opt.e;
      if (evt.altKey) {
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });



    this.canvas.on('mouse:up', () => {
      // @ts-ignore
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.isDragging = false;
      this.selection = true;
    });


    this.canvas.on('mouse:move', (opt) => {
      if (this.isDragging) {
        var e = opt.e;
        var vpt = this.canvas.viewportTransform;
        if (vpt) {
          vpt[4] += e.clientX - this.lastPosX;
          vpt[5] += e.clientY - this.lastPosY;
        }
        this.canvas.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });
  }

  addStickyNote() {
    const text = new fabric.IText('Sticky note!', {
      fill: '#000000',
      backgroundColor: '#FFFF00',
      padding: 10,
      hasControls: true,
      lockUniScaling: false,
    });

    text.setControlsVisibility({

    });

    this.canvas.add(text);
  }


  @HostListener('window:resize')
  onResize() {
    this.canvas.setWidth(window.innerWidth);
    this.canvas.setHeight(window.innerHeight);
  }
}

