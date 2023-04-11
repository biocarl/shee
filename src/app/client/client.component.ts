import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QueueService} from "../queue.service";
import {GroupService} from "../group.service";
import {WaitComponent} from "../wait/wait.component";
import {AnchorDirective} from "../anchor.directive";
import {ComponentChooserService} from "../component-chooser.service";
import {PresenterMessage} from "../presenter-message";
import {ParticipantService} from "../participant.service";

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
/**
 * The client component displays interactive components based on the presenter's messages.
 * @component
 * @implements {OnInit}
 */
export class ClientComponent implements OnInit {
  /**
   * The name of the group that the participant belongs to.
   * @type {string | null}
   */
  groupName: string | null = "";
  /**
   * The name of the participant.
   * @type {string | null}
   */
  participantName: string | null = "";

  /**
   * The anchor directive used to dynamically inject components into the view.
   * @type {AnchorDirective}
   */
  @ViewChild(AnchorDirective, {static: true}) anchor!: AnchorDirective;

  /**
   * The view container reference used to create and manipulate components dynamically.
   * @type {ViewContainerRef | undefined}
   */
  viewContainerRef ?: ViewContainerRef;

  /**
   * Creates a new instance of the ClientComponent.
   * @constructor
   * @param {ActivatedRoute} route The activated route containing the route parameters.
   * @param {QueueService} queueService The service for interacting with the presentation queue.
   * @param {GroupService} groupService The service for managing the group name.
   * @param {ComponentChooserService} componentChooserService The service for dynamically injecting components.
   * @param {ParticipantService} participantService The service for managing the participant name.
   */
  constructor(
    private route: ActivatedRoute,
    private queueService: QueueService,
    private groupService: GroupService,
    private componentChooserService: ComponentChooserService,
    private participantService: ParticipantService
  ) {
  }

  /**
   * Initializes the component by subscribing to route and query parameter changes,
   * setting the group and participant names, injecting a wait component,
   * and listening to presenter messages and injecting components dynamically.
   * @public
   * @returns {void}
   * @usageNotes
   * The component listens to route and query parameter changes to retrieve the group and participant names.
   * It then injects a wait component into the view while waiting for the presenter to initialize.
   * When presenter messages are received, the component chooser service is used to dynamically inject
   * components into the view based on the presenter's messages.
   */
  ngOnInit(): void {
    // Retrieve route parameter /:group from url
    this.route.paramMap.subscribe(params => {
      this.groupName = params.get("group");
      if (this.groupName) {
        this.groupService.setGroupName(this.groupName);
      }
    });
    this.route.queryParamMap.subscribe(params => {
      this.participantName = params.get("user");
      if (this.participantName) {
        this.participantService.setParticipantName(this.participantName);
      }
    })
    this.viewContainerRef = this.anchor.viewContainerRef;

    // Show "waiting" while presenter has not initialized yet
    this.viewContainerRef.createComponent<WaitComponent>(WaitComponent);

    // Listen to all presenter messages and inject component into view accordingly
    this.queueService.listenToPresenterChannel<PresenterMessage>(presenterMessage => {
      this.componentChooserService.injectComponent(this.anchor.viewContainerRef,
        presenterMessage.interaction, "client", presenterMessage);
    });
  }
}
