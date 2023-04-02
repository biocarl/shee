import {Injectable, ViewContainerRef} from '@angular/core';
import {PollPresenterComponent} from "./poll/poll-presenter/poll-presenter.component";
import {PresenterSubscribeResponse} from "./dto/presenter-subscribe-response";
import {PollClientComponent} from "./poll/poll-client/poll-client.component";
import {NotFoundComponent} from "./not-found/not-found.component";

@Injectable({
  providedIn: 'root'
})
export class ComponentChooserService {

  constructor() { }

  injectComponent(viewContainerRef: ViewContainerRef, interaction : string, type: string, event: PresenterSubscribeResponse) {
    if(!viewContainerRef){
      console.error("Error: Container ref is empty");
      return;
    }

    // clean container before injection
    viewContainerRef.clear();

    if(type === "presenter"){
      if(interaction === "poll"){
        console.log("Polling detected");
        const pollPresenterRef = viewContainerRef.createComponent<PollPresenterComponent>(PollPresenterComponent);
        pollPresenterRef.instance.populateWithData(event);
        return;
      }
    }

    if(type === "client"){
        if(interaction === "poll"){
          const pollClientRef = viewContainerRef.createComponent<PollClientComponent>(PollClientComponent);
          pollClientRef.instance.populateWithData(event);
          return;
        }
    }

    const ref404 = viewContainerRef.createComponent<NotFoundComponent>(NotFoundComponent);
    console.error("Error: No matching interaction id was found for " + interaction);
  }
}
