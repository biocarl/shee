import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QueueService} from "../queue.service";
import {GroupService} from "../group.service";
import {AnchorDirective} from "./anchor.directive";
import {PresenterSubscribeResponse} from "../dto/presenter-subscribe-response";
import {PresenterPublishRequest} from "../dto/presenter-publish-request";
import {PollPresenterComponent} from "../poll/poll-presenter/poll-presenter.component";


@Component({
  selector: 'app-presenter',
  templateUrl: './presenter.component.html',
  styleUrls: ['./presenter.component.css']
})
export class PresenterComponent{
  groupName: string | null = "";
  paramsPayload ?: PresenterPublishRequest;
  @ViewChild(AnchorDirective, {static: true}) anchor!: AnchorDirective;


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
    this.paramsPayload =  this.retrieveQueryParamsAsJson();

    // Listen to all presenter events for choosing which component to choose
    this.queueService.onPresenterEvent<PresenterSubscribeResponse>( presenterEvent=> {
      if(presenterEvent.interaction === "poll"){
        console.log("Polling detected");
        const _viewContainerRef = this.anchor.viewContainerRef;
        _viewContainerRef.clear(); // clean container
        const pollPresenterRef = _viewContainerRef.createComponent<PollPresenterComponent>(PollPresenterComponent);
        pollPresenterRef.instance.populateWithData(presenterEvent);
      }
    });

    // If a valid payload retrieved from parameters publish as presenter event
    if(this.paramsPayload.interaction){
      this.queueService.publishPresenterEvent<PresenterPublishRequest>(this.paramsPayload);
    }else{
      console.error('No valid presenter event via query provided. At least `interaction` field is required');
    }

  }

  retrieveQueryParamsAsJson() : PresenterPublishRequest {
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
      , {}) as PresenterPublishRequest;
  }
}
