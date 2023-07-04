import { fabric } from 'fabric';

interface FixedSizeTextboxOptions extends fabric.ITextboxOptions {
  fixedWidth?: number;
  fixedHeight?: number;
  originalGroup?: fabric.Group;
  textVisible?: boolean;
}

export class FixedSizeTextbox extends fabric.Textbox {
  fixedWidth?: number;
  fixedHeight?: number;
  originalGroup?: fabric.Group;
  textVisible?: boolean;

  constructor(text: string, options?: FixedSizeTextboxOptions) {
    super(text, options);

    this.fixedWidth = options?.fixedWidth;
    this.fixedHeight = options?.fixedHeight;
    this.originalGroup = options?.originalGroup;
    this.textVisible = options?.textVisible;
  }

  override toObject(propertiesToInclude?: string[]): any {
    propertiesToInclude = (propertiesToInclude || []).concat(['fixedWidth', 'fixedHeight', 'textVisible']);

    return super.toObject(propertiesToInclude);
  }
}
