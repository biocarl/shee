import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {Mode} from "../mode-toggle/mode-toggle.model";
import {Subscription} from "rxjs";
import {ModeToggleService} from "../mode-toggle/mode-toggle.service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  roomName: string = "";
  mode: Mode;
  Mode = Mode;
  inputError: boolean = false;
  modeSubscription: Subscription;
  host: string = environment.production ? "https://shee.app/" : "http://localhost:4200/";

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

  validateInput(event: KeyboardEvent) {
    const pattern = /^[A-Za-z0-9-]*$/; // Only numbers, letters and hyphens
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      event.preventDefault();
      this.inputError = true;
    } else {
      this.inputError = false;
    }
  }
}
