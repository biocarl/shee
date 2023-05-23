import { Component, OnInit } from '@angular/core';
import { ModeToggleService } from './mode-toggle.service';
import { Mode } from './mode-toggle.model';

@Component({
  selector: 'app-mode-toggle',
  templateUrl: './mode-toggle.component.html',
  styleUrls: ['./mode-toggle.component.css']
})
export class ModeToggleComponent implements OnInit {
  mode?: Mode;
  isLightMode?: boolean;

  constructor(private modeToggleService: ModeToggleService) { }

  ngOnInit() {
    this.mode = this.modeToggleService.currentMode;
    this.isLightMode = this.mode === Mode.LIGHT;

    this.modeToggleService.modeChanged$.subscribe(mode => {
      this.mode = mode;
      this.isLightMode = this.mode === Mode.LIGHT;
    });
  }

  toggle() {
    this.modeToggleService.toggleMode();
  }
}
