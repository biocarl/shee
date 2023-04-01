import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {VoteSelectorComponent} from "./vote-selector/vote-selector.component";
import {NoGroupComponent} from "./no-group/no-group.component";
import {NotFoundComponent} from "./not-found/not-found.component";
import {PresenterComponent} from "./presenter/presenter.component";

const routes: Routes = [
  {path: "", component: NoGroupComponent},
  {path: ":group", children: [
      {path: "" , component: VoteSelectorComponent},
      {path: "presenter" , component: PresenterComponent},
    ]},
  {path: "**", component: NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
