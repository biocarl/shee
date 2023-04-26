import { Component } from '@angular/core';
import {ModeToggleService} from "./mode-toggle.service";

@Component({
  selector: 'app-mode-toggle',
  templateUrl: './mode-toggle.component.html',
  styleUrls: ['./mode-toggle.component.css']
})
export class ModeToggleComponent {

  constructor(private modeToggleService: ModeToggleService) {}

  toggle() {
    this.modeToggleService.toggleMode();
  }

}

