import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QueueService} from "../queue.service";
import {GroupService} from "../group.service";
import {AnchorDirective} from "../anchor.directive";
import {QueryToEventService} from "./query-to-event.service";
import {ComponentChooserService} from "../component-chooser.service";
import {PresenterMessage} from "../presenter-message";
import {Subscription} from "rxjs";
import {Mode} from "../mode-toggle/mode-toggle.model";
import {ModeToggleService} from "../mode-toggle/mode-toggle.service";


@Component({
  selector: 'app-presenter',
  templateUrl: './presenter.component.html',
  styleUrls: ['./presenter.component.css']
})
/**
 * The presenter root component displays a specific client component based on the presenter's messages which
 * are forwarded from the query parameters within this component.
 * @component
 * @implements {OnInit}
 */
export class PresenterComponent implements OnInit {
  groupName: string | null = "";

  // The anchor directive used to dynamically inject components into the view
  @ViewChild(AnchorDirective, {static: true}) anchor!: AnchorDirective;

  mode: Mode;
  Mode = Mode;
  modeSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private queueService: QueueService,
    private groupService: GroupService,
    private queryToEventService: QueryToEventService,
    private componentChooserService: ComponentChooserService,
    private modeToggleService: ModeToggleService,
  ) {
    this.mode = modeToggleService.currentMode;
    this.modeSubscription = modeToggleService.modeChanged$.subscribe(
      (mode: Mode) => {
        this.mode = mode;
      }
    );
  }

  async ngOnInit(): Promise<void> {
    await this.retrieveRouteParameter();
    await this.subscribeToPresenterChannel();
    this.publishQueryParamAsPresenterEvent();
  }

  private async retrieveRouteParameter(): Promise<void> {
    this.route.paramMap.subscribe(params => {
      this.groupName = params.get("group");
      if (this.groupName) {
        this.groupService.setGroupName(this.groupName);
      }
    });
  }

  private async subscribeToPresenterChannel(): Promise<void> {
    await this.queueService.listenToPresenterChannel<PresenterMessage>(presenterMessage => {
      if (presenterMessage.questionID !== this.queueService.currentPresenterMessage?.questionID) {
        this.queueService.currentPresenterMessage = presenterMessage;
        this.componentChooserService.loadComponentIntoView(
          this.anchor.viewContainerRef,
          presenterMessage.interaction,
          "presenter",
          presenterMessage
        );
      }
    },"PresenterComponent.ngOnInit");
  }

  private publishQueryParamAsPresenterEvent(): void {
    this.queryToEventService.publishIfValid(this.route.snapshot.queryParamMap);
  }

}
