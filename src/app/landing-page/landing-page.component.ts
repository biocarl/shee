import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {Mode} from "../mode-toggle/mode-toggle.model";
import {Subscription} from "rxjs";
import {ModeToggleService} from "../mode-toggle/mode-toggle.service";

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  roomName: string = "";
  mode: Mode;
  Mode = Mode;
  modeSubscription: Subscription;

  constructor(private router: Router, private modeToggleService: ModeToggleService,) {
    this.mode = modeToggleService.currentMode;
    this.modeSubscription = modeToggleService.modeChanged$.subscribe(
      (mode: Mode) => {
        this.mode = mode;
      }
    );
  }

  navigateToInitializer() {
    this.router.navigate(["../" + this.roomName + "/presenter/new"]).then()
  }
}
