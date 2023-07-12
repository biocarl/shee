import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NotFoundComponent} from "./not-found/not-found.component";
import {PresenterComponent} from "./presenter/presenter.component";
import {ClientComponent} from "./client/client.component";
import {ModuleInitializerComponent} from "./module-initializer/module-initializer.component";
import {LandingPageComponent} from "./landing-page/landing-page.component";

const routes: Routes = [
  {path: "", component: LandingPageComponent},
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
