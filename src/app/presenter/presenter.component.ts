import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-presenter',
  templateUrl: './presenter.component.html',
  styleUrls: ['./presenter.component.css']
})
export class PresenterComponent implements OnInit{
  groupName: string = "";
  payload: any;

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Retrieve route parameter /:group from url
    this.groupName = this.route.snapshot.paramMap.get("group")  ?? "unknown";

    // Retrieve query parameter ?param1=value1&param2=... from url
    this.payload = this.route.snapshot.queryParamMap.keys.reduce( (agg, key )=> {
        const value = this.route.snapshot.queryParamMap.get(key) ?? "";
        if(value.includes(",")){
          // @ts-ignore
          agg[key] = value.split(",");
        }else {
          // @ts-ignore
          agg[key] = value;
        }
      return agg;
    }
    , {});
  }
}
