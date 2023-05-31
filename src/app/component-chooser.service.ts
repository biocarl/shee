import {ComponentRef, Injectable, Type, ViewContainerRef} from '@angular/core';
import {PollPresenterComponent} from "./poll/poll-presenter/poll-presenter.component";
import {PollClientComponent} from "./poll/poll-client/poll-client.component";
import {PairPresenterComponent} from "./pair/pair-presenter/pair-presenter.component";
import {PairClientComponent} from "./pair/pair-client/pair-client.component";
import {PresenterMessage} from "./presenter-message";
import {
  BrainstormingPresenterComponent
} from "./brainstorming/brainstorming-presenter/brainstorming-presenter.component";
import {BrainstormingClientComponent} from "./brainstorming/brainstorming-client/brainstorming-client.component";
import {DecisionChartClientComponent} from "./decision-chart/decision-client/decision-chart-client.component";
import {
  DecisionChartPresenterComponent
} from "./decision-chart/decision-chart-presenter/decision-chart-presenter.component";
import {LoggerService} from "./logger.service";
import {View} from "./view";

@Injectable({
  providedIn: 'root'
})
/**
 * The ComponentChooserService is responsible for dynamically injecting components into a given view container depending on the interaction and type.
 * @class
 * @Injectable
 */
export class ComponentChooserService {

  private typeMap: Record<string,Record<string,Type<View>>> = {
    presenter: {
      poll: PollPresenterComponent,
      pair: PairPresenterComponent,
      brainstorming: BrainstormingPresenterComponent,
      decision: DecisionChartPresenterComponent
    },
    client: {
      poll: PollClientComponent,
      pair: PairClientComponent,
      brainstorming: BrainstormingClientComponent,
      decision: DecisionChartClientComponent
    }
  }
  constructor(private log: LoggerService) {
  }

  loadComponentIntoView(viewContainerRef: ViewContainerRef, interaction: string, type: string, event: PresenterMessage) {
    this.log.logToConsole("Entered loadComponentIntoView()");
    if (!this.validate(viewContainerRef, interaction, type)) {return;}

    this.clearViewContainer(viewContainerRef);
    this.injectSelectedComponent(viewContainerRef, interaction, type, event);
  }

  private validate(viewContainerRef: ViewContainerRef, interaction: string, type: string): boolean {
    if (!viewContainerRef) {
      this.logError("Container ref is empty");
      return false;
    }

    if (!(type in this.typeMap) || !(interaction in this.typeMap[type])) {
      this.logError("No matching interaction id was found for " + interaction);
      return false;
    }

    return true;
  }

  private clearViewContainer(viewContainerRef: ViewContainerRef): void {
    viewContainerRef.clear();
  }

  private injectSelectedComponent(viewContainerRef: ViewContainerRef, interaction: string, type: string, event: PresenterMessage): void {
    this.log.logToConsole(`Start injecting ${type} component for interaction: ${interaction}`);

    const component = this.typeMap[type][interaction];
    const ref: ComponentRef<View> = viewContainerRef.createComponent(component);

    ref.instance.initializeComponent(event);

    this.log.logToConsole(`End injecting ${type} component for interaction: ${interaction}`);
  }

  private logError(message: string): void {
    console.error("Error: " + message);
  }
}
