import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {VoteSelectorComponent} from "./vote-selector/vote-selector.component";
import {NoGroupComponent} from "./no-group/no-group.component";
import {NotFoundComponent} from "./not-found/not-found.component";

const routes: Routes = [
  {path: "", component: NoGroupComponent},
  {path: ":group", component: VoteSelectorComponent},
  {path: "**", component: NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
