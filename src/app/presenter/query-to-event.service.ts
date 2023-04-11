import { Injectable } from '@angular/core';
import {ParamMap} from "@angular/router";
import {QueueService} from "../queue.service";

@Injectable({
  providedIn: 'root'
})
/**
 * The QueryToEventService is used to retrieve query parameters from the URL and publish them as presenter events.
 * @class
 * @Injectable
 */
export class QueryToEventService {
  /**
   * Creates a new instance of the QueryToEventService.
   * @constructor
   * @param {QueueService} queueService The service for interacting with the presentation queue.
   */
  constructor(private queueService : QueueService) { }
  /**
   * Retrieves query parameters from the URL and publishes them as a presenter event if they are valid.
   * @param {ParamMap} params The map of query parameters from the URL.
   * @public
   * @returns {void}
   */
  publishIfValid(params: ParamMap) {
    const jsonPayload = this.retrieveQueryParamsAsJson(params);

    // If a valid payload retrieved from parameters publish as presenter event
    if(jsonPayload.interaction){
      this.queueService.publishMessageToPresenterChannel<PresenterMessageCreationRequest>(jsonPayload);
    }else{
      console.error('No valid presenter event via query provided. At least `interaction` field is required');
    }
  }

  /**
   * Converts the query parameters to a JSON object.
   * @param {ParamMap} params The map of query parameters from the URL.
   * @private
   * @returns {PresenterMessageCreationRequest} The JSON object containing the query parameters.
   */
  retrieveQueryParamsAsJson(params : ParamMap) : PresenterMessageCreationRequest {
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
      , {}) as PresenterMessageCreationRequest;
  }
}

/**
 * The interface for the presenter message creation request.
 * This interface defines the structure of the JSON object created from the query parameters of the URL.
 * @interface
 */
interface PresenterMessageCreationRequest {
  /**
   * The type of interaction being created.
   * @type {string}
   */
  interaction: string;
}
