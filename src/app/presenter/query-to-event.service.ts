import { Injectable } from '@angular/core';
import {ParamMap} from "@angular/router";
import {PresenterPublishRequest} from "../dto/presenter-publish-request";
import {QueueService} from "../queue.service";

@Injectable({
  providedIn: 'root'
})
export class QueryToEventService {

  constructor(private queueService : QueueService) { }

  publishIfValid(params: ParamMap) {
    const jsonPayload = this.retrieveQueryParamsAsJson(params);

    // If a valid payload retrieved from parameters publish as presenter event
    if(jsonPayload.interaction){
      this.queueService.publishPresenterEvent<PresenterPublishRequest>(jsonPayload);
    }else{
      console.error('No valid presenter event via query provided. At least `interaction` field is required');
    }
  }

  retrieveQueryParamsAsJson(params : ParamMap) : PresenterPublishRequest {
    return params.keys.reduce( (agg, key )=> {
        const value = params.get(key) ?? "";
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
