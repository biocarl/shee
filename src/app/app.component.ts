import {Component, OnDestroy} from '@angular/core';
import {GroupService} from "./group.service";
import { Mode } from './mode-toggle/mode-toggle.model';
import {Subscription} from "rxjs";
import {ModeToggleService} from "./mode-toggle/mode-toggle.service";
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
/**
 * The root component of the application.
 * @class
 * @component
 */
export class AppComponent implements OnDestroy{
  envName = environment.name;
  /**
   * Creates a new instance of the AppComponent class.
   * @constructor
   * @param {GroupService} groupService The service for retrieving the group name.
   */

  mode: Mode;
  Mode = Mode;
  private modeSubscription: Subscription;
  constructor(protected groupService: GroupService, private modeToggleService: ModeToggleService) {
    this.mode = this.modeToggleService.currentMode;

    this.modeSubscription = this.modeToggleService.modeChanged$.subscribe(mode => {
      this.mode = mode;
    });
  }
  ngOnDestroy() {
    this.modeSubscription.unsubscribe();
  }
}
