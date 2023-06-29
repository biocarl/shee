import { fabric } from 'fabric';

interface FixedSizeTextboxOptions extends fabric.ITextboxOptions {
  fixedWidth?: number;
  fixedHeight?: number;
  originalGroup?: fabric.Group;
  visibleText?: string;
  visibleTextFontSize?: number;
  hiddenIcon?: string;
}

export class FixedSizeTextbox extends fabric.Textbox {
  fixedWidth?: number;
  fixedHeight?: number;
  originalGroup?: fabric.Group;
  visibleText?: string;
  visibleTextFontSize?: number;
  hiddenIcon?: string;

  constructor(text: string, options?: FixedSizeTextboxOptions) {
    super(text, options);

    this.fixedWidth = options?.fixedWidth;
    this.fixedHeight = options?.fixedHeight;
    this.originalGroup = options?.originalGroup;
    this.visibleText = options?.visibleText;
    this.visibleTextFontSize = options?.visibleTextFontSize;
    this.hiddenIcon = options?.hiddenIcon;
  }

  override toObject(propertiesToInclude?: string[]): any {
    propertiesToInclude = (propertiesToInclude || []).concat(['fixedWidth', 'fixedHeight', 'visibleText', 'visibleTextFontSize', 'hiddenIcon']);

    return super.toObject(propertiesToInclude);
  }
}
