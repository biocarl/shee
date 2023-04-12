import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Params, Router} from "@angular/router";

interface ModuleTypes {
  modules: ModuleType[];
}

interface ModuleType {
  parameters: ModuleParameter[];
  name: string
}

interface ModuleParameter {
  description: string;
  required: boolean;
  value: string;
  name: string;
}

@Component({
  selector: 'app-module-initializer',
  templateUrl: './module-initializer.component.html',
  styleUrls: ['./module-initializer.component.css']
})
/**
 * The module initializer components offers a user interface for populating a presenter view.
 * Access via following route /<groupName>/presenter/new
 * @component
 * @implements {OnInit}
 */
export class ModuleInitializerComponent implements OnInit{
  modules ?: ModuleType[];
  selectedModuleString: string = "poll";

  constructor(private http: HttpClient,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.http.get<ModuleTypes>('assets/modules.json').subscribe(data => {
      this.modules = data.modules;
      console.log(this.modules);
    });
  }

  selectedModule(selection: string): ModuleType {
    return this.modules?.find(el => el.name === selection) as ModuleType;
  }

  extractQueryParams(): Params {
    return this.selectedModule(this.selectedModuleString).parameters
      .reduce((acc, current) => {
          // @ts-ignore
          acc[current.name] = current.value;
          return acc
        },
        {
          "interaction": this.selectedModuleString
        });
  }

  initializeModuleWithParams() {
    const queryParams = this.extractQueryParams();
    this.router.navigate(['../../presenter'], {queryParams, relativeTo: this.route}).then();
  }
}
