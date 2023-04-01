import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QueueService} from "../queue.service";
import {GroupService} from "../group.service";


// TODO: Is the most general type (all other presenter events subscribe from this)
interface PresenterSubscribe {
  interaction: string;
  event: string;
}

@Component({
  selector: 'app-presenter',
  templateUrl: './presenter.component.html',
  styleUrls: ['./presenter.component.css']
})
export class PresenterComponent implements OnInit{
  groupName: string | null = "";
  payload: {} = {};

  constructor(
    private route: ActivatedRoute,
    private queueService : QueueService,
    private groupService : GroupService,
  ) {}

  ngOnInit(): void {
    // Retrieve route parameter /:group from url
    this.route.paramMap.subscribe( params => {
      this.groupName = params.get("group");
      if(this.groupName){
        this.groupService.setGroupName(this.groupName);
      }
    });

    // Retrieve query parameter ?param1=value1&param2=... from url
    this.payload =  this.retrieveQueryParamsAsJson();

    // Listen to all presenter events for choosing which component to choose
    this.queueService.onPresenterEvent<PresenterSubscribe>( presenterEvent=> {
      // if(presenterEvent.interaction === "poll"){
      if(presenterEvent.event === "question_event"){
        console.log("Event...");
        console.log("Polling detected");
      }
    });


    // If a valid payload retrieved from parameters publish as present event

  }

  retrieveQueryParamsAsJson() : {} {
    return this.route.snapshot.queryParamMap.keys.reduce( (agg, key )=> {
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
