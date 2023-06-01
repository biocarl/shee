import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
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
export class ClientComponent implements OnInit {
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

  async ngOnInit(): Promise<void> {
    await this.setParticipantAndGroupNames();
    this.setWaitComponent();
    this.requestLastMessage();
    this.subscribeToPresenterChannel();
  }

  private setParticipantAndGroupNames() {
    this.setGroupNameFromRouteParam();
    this.participantName = this.participantService.getParticipantName();
  }

  private setGroupNameFromRouteParam() {
    // Retrieve route parameter /:group from url
    this.route.paramMap.subscribe(params => {
      this.groupName = params.get("group");
      if (this.groupName) {
        this.groupService.setGroupName(this.groupName);
      }
    });
  }

  private setWaitComponent() {
    this.viewContainerRef = this.anchor.viewContainerRef;
    this.viewContainerRef.createComponent<WaitComponent>(WaitComponent);
  }

  private subscribeToPresenterChannel() {
    this.queueService.listenToPresenterChannel<PresenterMessage>(presenterMessage => {
      if (this.isNewQuestionOrClientOnly(presenterMessage)) {
        this.queueService.currentPresenterMessage = presenterMessage;
        this.loadComponent(presenterMessage);
      }
    },'ClientComponent.ngOnInit');
  }

  private loadComponent(presenterMessage: PresenterMessage) {
    this.componentChooserService.loadComponentIntoView(this.anchor.viewContainerRef,
      presenterMessage.interaction, "client", presenterMessage);
  }

  private isNewQuestionOrClientOnly(presenterMessage: PresenterMessage) {
    return !!(presenterMessage.questionID !== this.queueService.currentPresenterMessage?.questionID || presenterMessage.clientOnly);
  }

  private requestLastMessage() {
    this.log.logToConsole("Requested current question.");
    this.queueService.requestLastMessage<PresenterMessage>((presenterMessage, timestamp: number) => {
      this.adjustTimer(presenterMessage,timestamp);
        this.loadComponent(presenterMessage);
    });
  }

  private adjustTimer(presenterMessage: PresenterMessage, timestamp: number) {
    if (presenterMessage.timer) {
      let timeDifference = Math.floor(Date.now() / 1000) - timestamp;
      if (presenterMessage.timer - timeDifference > 0) {
        presenterMessage.timer -= timeDifference;
      } else {
        presenterMessage.timer = 0;
      }
    }
  }
}
