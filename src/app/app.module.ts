import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VoteSelectorComponent } from './vote-selector/vote-selector.component';
import {HttpClientModule} from "@angular/common/http";
import { NoGroupComponent } from './no-group/no-group.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PresenterComponent } from './presenter/presenter.component';

@NgModule({
  declarations: [
    AppComponent,
    VoteSelectorComponent,
    NoGroupComponent,
    NotFoundComponent,
    PresenterComponent
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
