import { fabric } from 'fabric';

interface FixedSizeTextboxOptions extends fabric.ITextboxOptions {
  fixedWidth?: number;
  fixedHeight?: number;
  originalGroup?: fabric.Group;
}

export class FixedSizeTextbox extends fabric.Textbox {
  fixedWidth?: number;
  fixedHeight?: number;
  originalGroup?: fabric.Group;

  constructor(text: string, options?: FixedSizeTextboxOptions) {
    super(text, options);

    this.fixedWidth = options?.fixedWidth;
    this.fixedHeight = options?.fixedHeight;
    this.originalGroup = options?.originalGroup;
  }
}
