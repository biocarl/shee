import {Injectable, ViewContainerRef} from '@angular/core';
import {PollPresenterComponent} from "./poll/poll-presenter/poll-presenter.component";
import {PresenterSubscribeResponse} from "./dto/presenter-subscribe-response";
import {PollClientComponent} from "./poll/poll-client/poll-client.component";
import {NotFoundComponent} from "./not-found/not-found.component";
import {CounterPresenterComponent} from "./counter/counter-presenter/counter-presenter.component";
import {CounterClientComponent} from "./counter/counter-client/counter-client.component";

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

    if(type != "client" && type != "presenter"){
      viewContainerRef.createComponent<NotFoundComponent>(NotFoundComponent);
      console.error("Error: No matching interaction id was found for " + interaction);
    }

    // clean container before injection
    viewContainerRef.clear();

    if(type === "presenter"){
      switch (interaction){
        case "poll" :
          const pollPresenterRef = viewContainerRef.createComponent<PollPresenterComponent>(PollPresenterComponent);
          pollPresenterRef.instance.populateWithData(event);
          break
        case "counter" :
          const counterRef = viewContainerRef.createComponent<CounterPresenterComponent>(CounterPresenterComponent);
          counterRef.instance.populateWithData(event);
          break;
        default :
          viewContainerRef.createComponent<NotFoundComponent>(NotFoundComponent);
          console.error("Error: No matching interaction id was found for " + interaction);
      }
    }

    if(type === "client"){
      switch (interaction){
        case "poll" :
          const pollClientRef = viewContainerRef.createComponent<PollClientComponent>(PollClientComponent);
          pollClientRef .instance.populateWithData(event);
          break
        case "counter" :
          const counterRef = viewContainerRef.createComponent<CounterClientComponent>(CounterClientComponent);
          counterRef.instance.populateWithData(event);
          break;
        default :
          viewContainerRef.createComponent<NotFoundComponent>(NotFoundComponent);
          console.error("Error: No matching interaction id was found for " + interaction);
      }
    }
  }
}
