import { Component, OnInit } from '@angular/core';
import { fabric } from 'fabric';

@Component({
  selector: 'app-inf-whiteboard',
  templateUrl: './inf-whiteboard.component.html',
  styleUrls: ['./inf-whiteboard.component.css']
})
export class InfWhiteboardComponent implements OnInit {
  private canvas!: fabric.Canvas;

  ngOnInit (): void {
    this.canvas = new fabric.Canvas('canvas', {
      backgroundColor: 'white',
    });
    this.canvas.setWidth(window.innerWidth - 100);
    this.canvas.setHeight(window.innerHeight);

    this.canvas.on('mouse:dblclick', (options) => {
      let target = options.target as fabric.Group;
      if (target && target.type === 'group') {
        // Get the objects and select the textbox.
        let items = target.getObjects();
        let textbox = items.find((obj) => obj.type === 'textbox') as fabric.Textbox;
        if (textbox) {
          console.log('Entering editing mode for:', textbox);
          target.removeWithUpdate(textbox);
          this.canvas.add(textbox);
          this.canvas.setActiveObject(textbox);
          textbox.enterEditing();
          items.forEach((item) => {
            if (item !== textbox) {
              item.set({ selectable: false });
            }
          });
        }
      }
    });
  }

  addStickyNote() {
    const stickyHeight = 200;
    const stickyWidth = 200;

    let shadow = new fabric.Shadow({
      color: 'rgb(0,0,0,0.5)',
      blur: 7,
      offsetX:1,
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
      left: 10,  // Start from the padding size
      top: 10,   // Start from the padding size
      fontSize: 21,
      width: stickyHeight-20,  // Rectangle's width (200) - 2 * padding size (10)
      fill: 'black',
      splitByGrapheme: true,
      //@ts-ignore
      fixedHeight: 150,
    });

      textbox.on('changed',() => {
        //@ts-ignore
        while(textbox.height < stickyHeight-20 ){
          // @ts-ignore
          textbox.fontSize++;
          console.log("Font size got bigger: " + textbox.fontSize);
          this.canvas.renderAll();
        }
        //@ts-ignore
        while(textbox.height > stickyHeight-20 ){
        // @ts-ignore
        textbox.fontSize--;
        console.log("Font size got smaller: " + textbox.fontSize);
        this.canvas.renderAll();
      }
      });

      textbox.on('editing:exited', () => {
      console.log('Exited editing mode for:', textbox);

      // Re-add the textbox to the group after editing is finished.
      group.addWithUpdate(textbox);
      this.canvas.remove(textbox);

      // Instead of removing the group, just deselect it and stop editing.
      this.canvas.discardActiveObject().renderAll();

      // Make items selectable again
      group.getObjects().forEach(item => item.set('selectable', true));
    });

    let group = new fabric.Group([rectangle, textbox], {});

    group.setControlsVisibility({
      mb: false,
      ml:false,
      mr:false,
      mt:false
    });

    this.canvas.add(group);
  }
}
