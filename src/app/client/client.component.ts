import {Component, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QueueService} from "../queue.service";
import {GroupService} from "../group.service";
import {WaitComponent} from "../wait/wait.component";
import {AnchorDirective} from "../anchor.directive";
import {ComponentChooserService} from "../component-chooser.service";
import {PresenterMessage} from "../presenter-message";
import {ParticipantService} from "../participant.service";
import {Mode} from "../mode-toggle/mode-toggle.model";
import {ModeToggleService} from "../mode-toggle/mode-toggle.service";
import {Subscription} from "rxjs";
import {LoggerService} from "../logger.service";

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
/**
 * The client root component displays a specific client component based on the presenter's messages.
 * @component
 * @implements {OnInit}
 */
export class ClientComponent implements OnInit, OnDestroy {
  groupName: string | null = "";
  participantName ?: string = "";
  @ViewChild(AnchorDirective, {static: true}) anchor!: AnchorDirective;
  viewContainerRef?: ViewContainerRef;
  mode: Mode;
  Mode = Mode;
  modeSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private queueService: QueueService,
    private groupService: GroupService,
    private componentChooserService: ComponentChooserService,
    private participantService: ParticipantService,
    private modeToggleService: ModeToggleService,
    private log: LoggerService

  ) {
    this.mode = modeToggleService.currentMode;
    this.modeSubscription = modeToggleService.modeChanged$.subscribe(
      (mode: Mode) => {
        this.mode = mode;
      }
    );
  }

  ngOnInit(): void {
    // Retrieve route parameter /:group from url
    this.route.paramMap.subscribe(params => {
      this.groupName = params.get("group");
      if (this.groupName) {
        this.groupService.setGroupName(this.groupName);
      }
    });

    this.participantName = this.participantService.getParticipantName();

    this.viewContainerRef = this.anchor.viewContainerRef;

    // Show "waiting" while presenter has not initialized yet
    this.viewContainerRef.createComponent<WaitComponent>(WaitComponent);

    // Listen to all presenter messages and inject component into view based on the interaction field
    this.queueService.listenToPresenterChannel<PresenterMessage>(presenterMessage => {

      this.handlePresenterMessageAndInjectComponent(presenterMessage);

    });

    // Request current question
   this.log.toConsole("Requested current question")
   this.queueService.publishMessageToClientChannel(this.queueService.questionTrigger);
  }

  ngOnDestroy() {
    this.modeSubscription.unsubscribe();
  }

  private isDifferentQuestionOrClientOnly(presenterMessage: PresenterMessage) {
    return !!(presenterMessage.questionID !== this.queueService.currentPresenterMessage?.questionID || presenterMessage.clientOnly);
  }

  private handlePresenterMessageAndInjectComponent(presenterMessage: PresenterMessage) {
    if (this.isDifferentQuestionOrClientOnly(presenterMessage)) {
      this.queueService.currentPresenterMessage = presenterMessage;
      this.componentChooserService.injectComponent(this.anchor.viewContainerRef,
        presenterMessage.interaction, "client", presenterMessage);
    }
  }
}
