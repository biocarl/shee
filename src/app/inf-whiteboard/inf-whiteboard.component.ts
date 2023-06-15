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
    let rectangle = new fabric.Rect({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      fill: 'yellow',
    });

    let textbox = new fabric.Textbox('Some text', {
      left: 30,  // Start from the padding size
      top: 30,   // Start from the padding size
      width: 140,  // Rectangle's width (200) - 2 * padding size (30)
      fill: 'black',
      splitByGrapheme: true,
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
    this.canvas.add(group);
  }
}
