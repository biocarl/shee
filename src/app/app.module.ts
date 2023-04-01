import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PollClientComponent } from './poll-client/poll-client.component';
import {HttpClientModule} from "@angular/common/http";
import { NoGroupComponent } from './no-group/no-group.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PresenterComponent } from './presenter/presenter.component';
import { PollPresenterComponent } from './poll-presenter/poll-presenter.component';

@NgModule({
  declarations: [
    AppComponent,
    PollClientComponent,
    NoGroupComponent,
    NotFoundComponent,
    PresenterComponent,
    PollPresenterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
