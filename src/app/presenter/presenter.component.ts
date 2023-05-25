import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QueueService} from "../queue.service";
import {GroupService} from "../group.service";
import {AnchorDirective} from "../anchor.directive";
import {QueryToEventService} from "./query-to-event.service";
import {ComponentChooserService} from "../component-chooser.service";
import {PresenterMessage} from "../presenter-message";
import {ClientQuestionRequest} from "../client-question-request";
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
    // Retrieve route parameter /:group from url
    this.route.paramMap.subscribe(params => {
      this.groupName = params.get("group");
      if (this.groupName) {
        this.groupService.setGroupName(this.groupName);
      }
    });

    // Listen to all presenter events for determining which component to choose based on interactionId
    await this.queueService.listenToPresenterChannel<PresenterMessage>(presenterMessage => {
      if (presenterMessage.questionID !== this.queueService.currentPresenterMessage?.questionID) {
        this.queueService.currentPresenterMessage = presenterMessage;
        this.componentChooserService.loadComponentIntoView(this.anchor.viewContainerRef,
          presenterMessage.interaction, "presenter", presenterMessage);
      }
    },"presenter.component.ts");

    // Listen to ClientChannel, if student joins late and requests current question
    await this.queueService.listenToClientChannel<ClientQuestionRequest>(clientMessage => {
      if (clientMessage.requestTrigger === this.queueService.questionTrigger.requestTrigger) {
        this.queueService.publishMessageToPresenterChannel(this.queueService.currentPresenterMessage)
      }
    })

    // Retrieve query parameter ?param1=value1&param2=... from url and publish as presenter event
    this.queryToEventService.publishIfValid(this.route.snapshot.queryParamMap);
  }
  ngOnDestroy() {
    this.modeSubscription.unsubscribe();
  }
}
