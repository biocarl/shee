import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[anchor]'
})
/**
 * The AnchorDirective is used to mark a container where a dynamic component should be injected.
 * @class
 * @directive
 */
export class AnchorDirective {

  // Host reference will be passed in into constructor
  constructor(public viewContainerRef: ViewContainerRef){}

}
