import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {NoGroupComponent} from "./no-group/no-group.component";
import {NotFoundComponent} from "./not-found/not-found.component";
import {PresenterComponent} from "./presenter/presenter.component";
import {PollClientComponent} from "./poll/poll-client/poll-client.component";

const routes: Routes = [
  {path: "", component: NoGroupComponent},
  {path: ":group", children: [
      {path: "" , component: PollClientComponent},
      {path: "presenter" , component: PresenterComponent},
    ]},
  {path: "**", component: NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
