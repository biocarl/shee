import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QueueService} from "../queue.service";
import {GroupService} from "../group.service";
import {AnchorDirective} from "../anchor.directive";
import {QueryToEventService} from "./query-to-event.service";
import {ComponentChooserService} from "../component-chooser.service";
import {PresenterMessage} from "../presenter-message";
import {ClientQuestionRequest} from "../client-question-request";


@Component({
  selector: 'app-presenter',
  templateUrl: './presenter.component.html',
  styleUrls: ['./presenter.component.css']
})
/**
 * The PresenterComponent is responsible for managing the presenter view and initializing the appropriate component
 * based on the presenter message.
 * @component
 * @implements {OnInit}
 */
export class PresenterComponent implements OnInit {
  /**
   * The name of the current group.
   * @type {string | null}
   * @public
   */
  groupName: string | null = "";
  /**
   * The anchor directive used to dynamically inject components into the view.
   * @type {AnchorDirective}
   */
  @ViewChild(AnchorDirective, {static: true}) anchor!: AnchorDirective;

  /**
   * Initializes a new instance of the PresenterComponent.
   * @constructor
   * @param {ActivatedRoute} route The route service for retrieving route parameters.
   * @param {QueueService} queueService The service for interacting with the presentation queue.
   * @param {GroupService} groupService The service for managing the group name.
   * @param {QueryToEventService} queryToEventService The service for publishing query parameters as presenter events.
   * @param {ComponentChooserService} componentChooserService The service for determining which component to inject.
   */
  constructor(
    private route: ActivatedRoute,
    private queueService: QueueService,
    private groupService: GroupService,
    private queryToEventService: QueryToEventService,
    private componentChooserService: ComponentChooserService
  ) {
  }

  /**
   * Initializes the component by setting the group name and listening to presenter messages.
   * Also retrieves query parameters and publishes them as presenter events if valid.
   * @public
   * @returns {void}
   * @memberof PresenterComponent
   */
  ngOnInit(): void {
    // Retrieve route parameter /:group from url
    this.route.paramMap.subscribe(params => {
      this.groupName = params.get("group");
      if (this.groupName) {
        this.groupService.setGroupName(this.groupName);
      }
    });

    // Listen to all presenter events for determining which component to choose
    this.queueService.listenToPresenterChannel<PresenterMessage>(presenterMessage => {
      if (presenterMessage.question_id !== this.queueService.currentPresenterMessage?.question_id) {
        this.queueService.currentPresenterMessage = presenterMessage;
        this.componentChooserService.injectComponent(this.anchor.viewContainerRef,
          presenterMessage.interaction, "presenter", presenterMessage);
      }
    });

    // Retrieve query parameter ?param1=value1&param2=... from url and publish as presenter event
    this.queryToEventService.publishIfValid(this.route.snapshot.queryParamMap);

    // Listen to ClientChannel, if student joins late and requests current question
    this.queueService.listenToClientChannel<ClientQuestionRequest>(clientMessage => {
      if (clientMessage.requestTrigger === this.queueService.questionTrigger.requestTrigger) {
        this.queueService.publishMessageToPresenterChannel(this.queueService.currentPresenterMessage)
      }
    })
  }
}
