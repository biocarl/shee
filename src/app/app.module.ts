import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {NotFoundComponent} from './not-found/not-found.component';
import {PresenterComponent} from './presenter/presenter.component';
import {PollClientComponent} from "./poll/poll-client/poll-client.component";
import {PollPresenterComponent} from "./poll/poll-presenter/poll-presenter.component";
import {ClientComponent} from './client/client.component';
import {WaitComponent} from './wait/wait.component';
import {AnchorDirective} from "./anchor.directive";
import {DecisionChartClientComponent} from './decision-chart/decision-client/decision-chart-client.component';
import {
  DecisionChartPresenterComponent
} from './decision-chart/decision-chart-presenter/decision-chart-presenter.component';
import {ModuleInitializerComponent} from "./module-initializer/module-initializer.component";
import {FormsModule} from "@angular/forms";
import {PairPresenterComponent} from './pair/pair-presenter/pair-presenter.component';
import {PairClientComponent} from './pair/pair-client/pair-client.component';
import {BrainstormingClientComponent} from './brainstorming/brainstorming-client/brainstorming-client.component';
import {
  BrainstormingPresenterComponent
} from './brainstorming/brainstorming-presenter/brainstorming-presenter.component';
import {ModeToggleModule} from "./mode-toggle/mode-toggle.module";
import {NgOptimizedImage} from "@angular/common";
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ClipboardModule} from "@angular/cdk/clipboard";
import {InfWhiteboardComponent} from './inf-whiteboard/inf-whiteboard.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button'
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TimerPopupComponent} from './brainstorming/brainstorming-presenter/timer-popup/timer-popup.component';
import {MatRadioModule} from '@angular/material/radio';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LandingPageComponent } from './landing-page/landing-page.component';
import {MatTooltipModule} from "@angular/material/tooltip";


@NgModule({
  declarations: [
    AppComponent,
    PollClientComponent,
    NotFoundComponent,
    PresenterComponent,
    PollPresenterComponent,
    AnchorDirective,
    ClientComponent,
    WaitComponent,
    DecisionChartClientComponent,
    DecisionChartPresenterComponent,
    ModuleInitializerComponent,
    PairPresenterComponent,
    PairClientComponent,
    BrainstormingClientComponent,
    BrainstormingPresenterComponent,
    InfWhiteboardComponent,
    BrainstormingPresenterComponent,
    TimerPopupComponent,
    LandingPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ModeToggleModule,
    NgOptimizedImage,
    DragDropModule,
    ClipboardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatTooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
