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
  /**
   Creates a new instance of the AnchorDirective, which is used to mark a container where a dynamic component should be injected.
   @constructor
   @param {ViewContainerRef} viewContainerRef A reference to the view container of the host element where the directive is applied.
   */
  constructor(public viewContainerRef: ViewContainerRef){}

}
