import {Component, OnInit} from '@angular/core';
import {GroupService} from "./group.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  constructor(protected groupService: GroupService) {}
}
