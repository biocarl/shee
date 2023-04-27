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
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
/**
 * The ComponentChooserService is responsible for dynamically injecting components into a given view container depending on the interaction and type.
 * @class
 * @Injectable
 */
export class ComponentChooserService {
  constructor() { }

  /**
   * Injects a component into the given view container depending on the interaction and type.
   * @param {ViewContainerRef} viewContainerRef The reference to the view container where the component should be injected.
   * @param {string} interaction The interaction id for the component to be injected.
   * @param {string} type The type of the component, can be "client" or "presenter".
   * @param {PresenterMessage} event The presenter message containing data to be passed into the component.
   * @public
   * @returns {void}
   */
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

    if(environment.production) {
      console.log(`Start injecting ${type} component for interaction: ${interaction}`);
    }
    if(type === "presenter"){
      switch (interaction){
        case "poll" :
          const pollPresenterRef = viewContainerRef.createComponent<PollPresenterComponent>(PollPresenterComponent);
          pollPresenterRef.instance.initializeComponent(event);
          if(environment.production) {
            console.log(`End injecting ${type} component for interaction: ${interaction}`);
          }
          break
        case "pair" :
          const counterRef = viewContainerRef.createComponent<PairPresenterComponent>(PairPresenterComponent);
          counterRef.instance.initializeComponent(event);
            if(environment.production) {
              console.log(`End injecting ${type} component for interaction: ${interaction}`);
            }
          break
        case "brainstorming" :
          const brainstormingRef = viewContainerRef.createComponent<BrainstormingPresenterComponent>(BrainstormingPresenterComponent);
          brainstormingRef.instance.initializeComponent(event);
              if(environment.production) {
                console.log(`End injecting ${type} component for interaction: ${interaction}`);
              }
          break;
        case "decision" :
          const decisionPresenterRef = viewContainerRef.createComponent<DecisionChartPresenterComponent>(DecisionChartPresenterComponent);
          decisionPresenterRef.instance.initializeComponent(event);
                if(environment.production) {
                  console.log(`End injecting ${type} component for interaction: ${interaction}`);
                }
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
          if(environment.production) {
            console.log(`End injecting ${type} component for interaction: ${interaction}`);
          }
          break
        case "pair" :
          const counterRef = viewContainerRef.createComponent<PairClientComponent>(PairClientComponent);
          counterRef.instance.initializeComponent(event);
            if(environment.production) {
              console.log(`End injecting ${type} component for interaction: ${interaction}`);
            }
          break
        case "brainstorming" :
          const brainstormingRef = viewContainerRef.createComponent<BrainstormingClientComponent>(BrainstormingClientComponent);
          brainstormingRef.instance.initializeComponent(event);
              if(environment.production) {
                console.log(`End injecting ${type} component for interaction: ${interaction}`);
              }
          break;
        case "decision" :
          const decisionClientRef = viewContainerRef.createComponent<DecisionChartClientComponent>(DecisionChartClientComponent);
          decisionClientRef.instance.initializeComponent(event);
                if(environment.production) {
                  console.log(`End injecting ${type} component for interaction: ${interaction}`);
                }
          break;
        default :
          viewContainerRef.createComponent<NotFoundComponent>(NotFoundComponent);
          console.error("Error: No matching interaction id was found for " + interaction);
      }
    }
  }
}
