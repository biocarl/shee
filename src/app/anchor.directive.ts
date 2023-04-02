import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[anchor]'
})
export class AnchorDirective {

  // Host reference will be passed in into constructor
  constructor(public viewContainerRef: ViewContainerRef){}

}
