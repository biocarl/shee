import {fabric} from 'fabric';
import {FixedSizeTextbox} from "./fixed-size-textbox";
import {CanvasObject} from "../canvas-object";

const STICKY_NOTE_DIMENSIONS = 200;
const STICKY_NOTE_PADDING = 10;
const MAX_FONT_SIZE = 200;
const TEXTBOX_DIMENSIONS = STICKY_NOTE_DIMENSIONS - 2 * STICKY_NOTE_PADDING;

//canvasObject-factory
export class StickyNoteFactory implements CanvasObject<fabric.Group> {
  private canvas!: fabric.Canvas;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  public create(textVisible?: boolean, text?: string, color?: string): fabric.Group {
    const rectangle = this.createRectangle(color);
    const textbox = this.createTextbox(textVisible, text);
    const stickyNote = new fabric.Group([rectangle, textbox]);

    this.setStyle(stickyNote);

    this.attachDoubleClickHandler(stickyNote);
    this.canvas.add(stickyNote);
    stickyNote.viewportCenter();
    return stickyNote;
  }

  private createShadow(): fabric.Shadow {
    return new fabric.Shadow({
      color: 'rgb(0,0,0,0.5)',
      blur: 7,
      offsetX: 1,
      offsetY: 1,
    });
  }

  private createRectangle(color?: string): fabric.Rect {
    return new fabric.Rect({
      left: 0,
      top: 0,
      width: STICKY_NOTE_DIMENSIONS,
      height: STICKY_NOTE_DIMENSIONS,
      fill: color ? color : 'rgb(255, 215, 7)',
      shadow: this.createShadow(),
    });
  }

  private createTextbox(textVisible?: boolean, text?: string): FixedSizeTextbox {
    let textbox = new FixedSizeTextbox('', {
      hasBorders: false,
      textAlign: "center",
      left: STICKY_NOTE_PADDING,
      top: STICKY_NOTE_PADDING,
      fontSize: 21,
      width: TEXTBOX_DIMENSIONS,
      fill: text ? 'transparent' : 'rgb(0,0,0,0.87)',
      fixedHeight: TEXTBOX_DIMENSIONS,
      fixedWidth: TEXTBOX_DIMENSIONS,
      objectCaching: false,
      text: textVisible ? text : "❔",
      hiddenIcon: "❔",
      visibleText: text ? text : ""
    });

    if (text) {
      // Delay execution until rendering is finished
      setTimeout(() => {
        this.adjustFontSize(textbox);
        textbox.fill = 'rgb(0,0,0,0.87)'
        this.canvas.renderAll();
      }, 0);
    }

    textbox.on('changed', () => {
      this.adjustFontSize(textbox);
    });

    // textbox.on('editing:exited', () => {
    //   this.handleTextboxEditingExited(textbox);
    //   if (textbox.text) {
    //     textbox.text = textbox.text.trim();
    //     textbox.fire('changed');
    //   }
    // });
    return textbox;
  }

  private setStyle(stickyNote: fabric.Group) {
    stickyNote.setControlsVisibility({
      mb: false,
      ml: false,
      mr: false,
      mt: false
    });

    stickyNote.set({
      borderColor: 'white',
      cornerStrokeColor: 'white',
      lockScalingFlip: true,
    });
  }


  private adjustFontSize(textbox: FixedSizeTextbox) {
    while (this.isTextboxTooSmall(textbox)) {
      this.increaseFontSize(textbox);
    }
    while (this.isTextboxTooLarge(textbox)) {
      this.decreaseFontSize(textbox);
    }
    this.adjustFontSizeForWidth(textbox);
    textbox.visibleTextFontSize = textbox.fontSize;
  }

  private isTextboxTooSmall(textbox: FixedSizeTextbox): boolean {
    return textbox.height! < STICKY_NOTE_DIMENSIONS - 20 && textbox.fontSize! <= MAX_FONT_SIZE;
  }

  private increaseFontSize(textbox: FixedSizeTextbox) {
    textbox.fontSize!++;
    this.canvas.renderAll();
  }

  private isTextboxTooLarge(textbox: FixedSizeTextbox): boolean {
    return textbox.height! > STICKY_NOTE_DIMENSIONS - 20 && textbox.fontSize! >= 1;
  }

  private decreaseFontSize(textbox: FixedSizeTextbox) {
    textbox.fontSize!--;
    this.canvas.renderAll();
  }

  private adjustFontSizeForWidth(textbox: FixedSizeTextbox) {
    if (textbox.width && textbox.fixedWidth && textbox.fontSize) {
      if (textbox.width > textbox.fixedWidth) {
        textbox.fontSize *= textbox.fixedWidth / (textbox.width + 1);
        textbox.width = textbox.fixedWidth;
      }
    }
    this.canvas.renderAll();
  }

  private findGroupContainingTextbox(textbox: FixedSizeTextbox): fabric.Group | undefined {
    const groups = this.canvas.getObjects('group') as fabric.Group[];
    let group = groups.find((group) => group.getObjects().includes(textbox));

    if (!group && textbox.originalGroup) {
      group = textbox.originalGroup;
    }
    return group;
  }

  private deselectGroup() {
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }

  private makeObjectsSelectable(group: fabric.Group) {
    const items = group.getObjects();
    items.forEach((item) => item.set({selectable: true}));
  }

  private handleDoubleClick(options: fabric.IEvent<MouseEvent>) {
    let target = options.target as fabric.Group;

    if (target && target.type === 'group') {
      let items = target.getObjects();
      let textbox = items.find((obj) => obj.type === 'textbox') as FixedSizeTextbox;
      if (textbox) {
        textbox.originalGroup = target;
        textbox.clone((clonedObj: FixedSizeTextbox) => {
          let textboxForEdit = clonedObj as FixedSizeTextbox;

          if (textbox.originalGroup) {
            clonedObj.set({
              //TODO padding relative to center for left/top
              left: textbox.originalGroup.left! ,
              top: textbox.originalGroup.top! ,
              angle: textbox.originalGroup.angle,
              scaleX: textbox.originalGroup.scaleX,
              scaleY: textbox.originalGroup.scaleY,
              hasBorders: false
            })
            clonedObj.rotate(target.angle!);
            console.log("textboxForEdit", textboxForEdit);

            textboxForEdit.on('changed', () => {
              this.adjustFontSize(textboxForEdit);
            });

            textboxForEdit.on('editing:exited', () => {
              this.handleTextboxEditingExited(textboxForEdit);
              if (textboxForEdit.text) {
                textbox.text = textboxForEdit.text.trim();
                textbox.fire('changed');
              }
            });

            textbox.visible = false;
            this.canvas.add(textboxForEdit);
            this.canvas.requestRenderAll();

            this.canvas.setActiveObject(textboxForEdit);
            textboxForEdit.enterEditing();
            textboxForEdit.originalGroup = target;
            items.forEach((item) => {
              if (item !== textboxForEdit) {
                item.set({selectable: false});
              }
            });
          }
        });
      }
    }
  }


  private handleTextboxEditingExited(textbox: FixedSizeTextbox) {
    const stickyNote = this.findGroupContainingTextbox(textbox);
    if (stickyNote) {
      let items = stickyNote.getObjects();
      items.forEach((item) => {
        console.log("item:", item);
        if (item.type === "textbox" && item instanceof FixedSizeTextbox) {
          item.set({
            text: textbox.text,
            visibleText: textbox.text,
            visible: true
          });
          item.fire('changed');
        }
      });
      this.canvas.remove(textbox);
      this.makeObjectsSelectable(stickyNote);
      this.deselectGroup();
    }
  }

  attachDoubleClickHandler(stickyNote: fabric.Group) {
    stickyNote.on('mousedblclick', this.handleDoubleClick.bind(this));
  }

  public setBackgroundColor(object: fabric.Group, color: string):
    void {
    object.getObjects().forEach(object => {
      if (object.type === 'rect') {
        object.set({fill: color});
      }
    });
    this.canvas.renderAll();
  }
}

