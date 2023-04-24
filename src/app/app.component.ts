import {Component} from '@angular/core';
import {GroupService} from "./group.service";
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
export class AppComponent{
  envName = environment.name;
  /**
   * Creates a new instance of the AppComponent class.
   * @constructor
   * @param {GroupService} groupService The service for retrieving the group name.
   */
  constructor(protected groupService: GroupService) {}
}
