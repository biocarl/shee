import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NoGroupComponent } from './no-group/no-group.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PresenterComponent } from './presenter/presenter.component';
import { PollClientComponent } from './poll/poll-client/poll-client.component';
import { PollPresenterComponent } from './poll/poll-presenter/poll-presenter.component';
import { ClientComponent } from './client/client.component';
import { WaitComponent } from './wait/wait.component';
import { AnchorDirective } from './anchor.directive';
import { CounterPresenterComponent } from './counter/counter-presenter/counter-presenter.component';
import { CounterClientComponent } from './counter/counter-client/counter-client.component';

@NgModule({
  declarations: [
    AppComponent,
    PollClientComponent,
    NoGroupComponent,
    NotFoundComponent,
    PresenterComponent,
    PollPresenterComponent,
    AnchorDirective,
    ClientComponent,
    WaitComponent,
    CounterPresenterComponent,
    CounterClientComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
