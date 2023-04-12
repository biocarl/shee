import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NoGroupComponent} from "./no-group/no-group.component";
import {NotFoundComponent} from "./not-found/not-found.component";
import {PresenterComponent} from "./presenter/presenter.component";
import {ClientComponent} from "./client/client.component";
import {ModuleInitializerComponent} from "./module-initializer/module-initializer.component";

const routes: Routes = [
  {path: "", component: NoGroupComponent},
  {
    path: ":group", children: [
      {path: "", component: ClientComponent},
      {path: "presenter", children: [
          {path: "", component: PresenterComponent},
          {path: "new", component: ModuleInitializerComponent},
        ]
      },
    ]
  },
  {path: "**", component: NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
