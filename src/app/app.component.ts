import {Component, OnInit} from '@angular/core';
import {GroupService} from "./group.service";
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  envName = environment.name;
  constructor(protected groupService: GroupService) {}
}
