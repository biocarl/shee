import {Injectable, ViewContainerRef} from '@angular/core';
import {PollPresenterComponent} from "./poll/poll-presenter/poll-presenter.component";
import {PollClientComponent} from "./poll/poll-client/poll-client.component";
import {NotFoundComponent} from "./not-found/not-found.component";
import {PairPresenterComponent} from "./pair/pair-presenter/pair-presenter.component";
import {PairClientComponent} from "./pair/pair-client/pair-client.component";
import {PresenterMessage} from "./presenter-message";
import {BrainstormingPresenterComponent} from "./brainstorming/brainstorming-presenter/brainstorming-presenter.component";
import {BrainstormingClientComponent} from "./brainstorming/brainstorming-client/brainstorming-client.component";
import {DecisionChartClientComponent} from "./decision-chart/decision-client/decision-chart-client.component";
import {DecisionChartPresenterComponent} from "./decision-chart/decision-chart-presenter/decision-chart-presenter.component";

@Injectable({
  providedIn: 'root'
})
export class ComponentChooserService {

  constructor() { }

  injectComponent(viewContainerRef: ViewContainerRef, interaction : string, type: string, event: PresenterMessage) {
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
          pollPresenterRef.instance.initializeComponent(event);
          break
        case "pair" :
          const counterRef = viewContainerRef.createComponent<PairPresenterComponent>(PairPresenterComponent);
          counterRef.instance.initializeComponent(event);
          break
        case "brainstorming" :
          const brainstormingRef = viewContainerRef.createComponent<BrainstormingPresenterComponent>(BrainstormingPresenterComponent);
          brainstormingRef.instance.initializeComponent(event);
          break;
        case "decision" :
          const decisionPresenterRef = viewContainerRef.createComponent<DecisionChartPresenterComponent>(DecisionChartPresenterComponent);
          decisionPresenterRef.instance.initializeComponent(event);
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
          pollClientRef .instance.initializeComponent(event);
          break
        case "pair" :
          const counterRef = viewContainerRef.createComponent<PairClientComponent>(PairClientComponent);
          counterRef.instance.initializeComponent(event);
          break
        case "brainstorming" :
          const brainstormingRef = viewContainerRef.createComponent<BrainstormingClientComponent>(BrainstormingClientComponent);
          brainstormingRef.instance.initializeComponent(event);
          break;
        case "decision" :
          const decisionClientRef = viewContainerRef.createComponent<DecisionChartClientComponent>(DecisionChartClientComponent);
          decisionClientRef.instance.initializeComponent(event);
          break;
        default :
          viewContainerRef.createComponent<NotFoundComponent>(NotFoundComponent);
          console.error("Error: No matching interaction id was found for " + interaction);
      }
    }
  }
}
