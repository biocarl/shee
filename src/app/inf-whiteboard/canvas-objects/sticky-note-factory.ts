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

  public create(textVisible?: boolean, text?: string, color?: string,presenter?:boolean): fabric.Group {
    const rectangle = this.createRectangle(color);
    const textbox = this.createTextbox(textVisible, text);
    //hacky fix for text resizing before the rest is added
    this.canvas.add(textbox);
    textbox.fire("changed");
    const stickyNote = new fabric.Group([rectangle, textbox]);
    this.canvas.remove(textbox);
    //
    this.createHiddenIcon(stickyNote, textVisible);
    this.createVotingCounter(stickyNote);
    this.setStyle(stickyNote);
    if(presenter === true){
      rectangle.stroke = 'rgb(63,63,63)';
      rectangle.strokeWidth = 3;
    }
    this.attachDoubleClickHandler(stickyNote);

    stickyNote.toObject = (function (toObject) {
      return function (this: fabric.Group) {
        return fabric.util.object.extend(toObject.call(this), {
          name: this.name,
        });
      };
    })(fabric.Group.prototype.toObject);
    stickyNote.name = presenter ? "stickyNotePresenter" : "stickyNote";

    this.canvas.add(stickyNote);
    stickyNote.viewportCenterV();
    let offsetX = this.canvas.getObjects().length;
    stickyNote.left! += 20*offsetX;
    stickyNote.setCoords();

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
      shadow: this.createShadow()
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
      fill: textVisible ? 'rgb(0,0,0,0.87)' : 'transparent',
      fixedHeight: TEXTBOX_DIMENSIONS,
      fixedWidth: TEXTBOX_DIMENSIONS,
      objectCaching: false,
      text: text,
      textVisible: textVisible,
    });

    textbox.on('changed', () => {
      this.adjustFontSize(textbox);
    });

    return textbox;
  }

  private createVotingCounter(stickyNote:fabric.Group) {
    let votingCounter = new fabric.Group();
    const counter = new fabric.Text('0', {
      selectable: false,
      fontSize: 19,
      objectCaching: false
    });
    const background = new fabric.Rect({
      fill: "rgb(255,255,255,0.87)",
      rx: 15,
      ry: 100,
      objectCaching: false
    });
    fabric.loadSVGFromURL('/assets/SVG/Thumbs_Up_Icon.svg', (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({
        scaleX: 0.2,
        scaleY: 0.2,
        left: 5,
        top: 1,
        objectCaching: false
      });
      background.set({
        width: counter.width! + obj.width! * 0.2 + 10,
        height: counter.height! + 5
      });
      counter.set({
        left: obj.width! * 0.2 + 6,
        top: 3
      });

      votingCounter.toObject = (function (toObject) {
        return function (this: fabric.Group) {
          return fabric.util.object.extend(toObject.call(this), {
            name: this.name
          });
        };
      })(fabric.Group.prototype.toObject);

      votingCounter.name = "votingCounter";
      votingCounter.addWithUpdate(background);
      votingCounter.addWithUpdate(obj);
      votingCounter.addWithUpdate(counter);

      // Set the position of the votingCounter at the bottom left of the sticky note.
      votingCounter.set({
        left: 0,
        top: STICKY_NOTE_DIMENSIONS - votingCounter.height!,
        visible: false,
      });

      votingCounter.left = 100 - votingCounter.width! / 2;
      votingCounter.top = 75 + votingCounter.height! / 2;
      stickyNote.add(votingCounter);
      this.canvas.renderAll();
    });
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
    this.adjustFontSizeForHeight(textbox);
    this.adjustFontSizeForWidth(textbox);
    this.canvas.renderAll();
  }

  private adjustFontSizeForHeight(textbox: FixedSizeTextbox) {
    const stepSize = 10;

    while (this.isTextboxTooSmall(textbox)) {
      this.increaseFontSize(textbox, stepSize);
    }

    while (this.isTextboxTooLarge(textbox)) {
      this.decreaseFontSize(textbox, stepSize);
    }

    // Fine tune the font size, 1 pixel at a time
    while (this.isTextboxTooSmall(textbox)) {
      this.increaseFontSize(textbox, 1);
    }

    while (this.isTextboxTooLarge(textbox)) {
      this.decreaseFontSize(textbox, 1);
    }
  }

  private isTextboxTooSmall(textbox: FixedSizeTextbox): boolean {
    return textbox.height! < STICKY_NOTE_DIMENSIONS - 20 && textbox.fontSize! <= MAX_FONT_SIZE;
  }

  private increaseFontSize(textbox: FixedSizeTextbox, step: number) {
    textbox.fontSize! += step;
    this.canvas.renderAll();
  }

  private isTextboxTooLarge(textbox: FixedSizeTextbox): boolean {
    return textbox.height! > STICKY_NOTE_DIMENSIONS - 20 && textbox.fontSize! >= 1;
  }

  private decreaseFontSize(textbox: FixedSizeTextbox, step: number) {
    textbox.fontSize! -= step;
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
      target.bringToFront();
      let items = target.getObjects();
      let textbox = items.find((obj) => obj.type === 'textbox') as FixedSizeTextbox;
      if (textbox && textbox.textVisible) {
        textbox.originalGroup = target;
        textbox.clone((clonedObj: FixedSizeTextbox) => {
          let textboxForEdit = clonedObj as FixedSizeTextbox;

          if (textbox.originalGroup) {
            clonedObj.set({
              //TODO padding relative to center for left/top
              left: textbox.originalGroup.left!,
              top: textbox.originalGroup.top!,
              angle: textbox.originalGroup.angle,
              scaleX: textbox.originalGroup.scaleX,
              scaleY: textbox.originalGroup.scaleY,
              hasBorders: false,
              objectCaching: false,
              originalGroup: textbox.originalGroup
            })
            clonedObj.rotate(target.angle!);

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
        if (item.type === "textbox" && item instanceof FixedSizeTextbox) {
          item.set({
            text: textbox.text,
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

  private createHiddenIcon(stickyNote: fabric.Group, textVisible?: boolean) {
    const svgString = "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"1em\" viewBox=\"0 0 640 512\"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d=\"M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z\"/></svg>";
    fabric.loadSVGFromString(svgString, (objects, options) => {
      let obj = fabric.util.groupSVGElements(objects, options);
      obj.scaleToHeight(STICKY_NOTE_DIMENSIONS - STICKY_NOTE_PADDING);
      obj.scaleToWidth(STICKY_NOTE_DIMENSIONS - STICKY_NOTE_PADDING);
      obj.visible = !textVisible;
      obj.originX = "center";
      obj.originY = "center";
      obj.toObject = (function (toObject) {
        return function (this: fabric.Group) {
          return fabric.util.object.extend(toObject.call(this), {
            name: this.name
          });
        };
      })(fabric.Group.prototype.toObject);
      obj.name = "hiddenSVG";
      stickyNote.add(obj);
      this.canvas.renderAll();
    });
  }
}

