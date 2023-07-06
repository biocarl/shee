import {Component, OnDestroy, OnInit} from '@angular/core';
import {PresenterMessage} from '../../presenter-message';
import {BrainstormingPresenterSubscribeResponse} from '../brainstorming-presenter-subscribe-response';
import {QueueService} from '../../queue.service';
import {BrainstormingClientSubscribeResponse} from '../brainstorming-client-subscribe-response';
import {BrainstormingPresenterStatusVotingRequest} from '../brainstorming-presenter-status-voting-request';
import {BrainstormingPresenterPublishRequest} from '../brainstorming-presenter-publish-request';
import {View} from '../../view';
import {MatDialog} from '@angular/material/dialog';
import {TimerPopupComponent} from './timer-popup/timer-popup.component';
import {CanvasObjectService} from "../canvas-object.service";
import {FixedSizeTextbox} from "../../inf-whiteboard/canvas-objects/fixed-size-textbox";
import {fabric} from "fabric";
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-brainstorming-presenter',
  templateUrl: './brainstorming-presenter.component.html',
  styleUrls: ['./brainstorming-presenter.component.css'],
})
export class BrainstormingPresenterComponent implements View, OnInit, OnDestroy {
  private isSingleChoice: boolean = false;
  private timerInterval: any;
  ideaEvent?: BrainstormingPresenterSubscribeResponse;
  ideaResponses: string[] = [];
  //maxZIndex = 20;
  stickyContentVisible: boolean = false;
  votes: number[] = [];
  timerLengthVoting?: number;
  timerLengthBrainstorming?: number;
  stage: 'initial' | 'brainstorming' | 'afterBrainstorming' | 'voting' =
    'initial';
  private canvas?: fabric.Canvas;
  private canvasObjectsSubscription?: Subscription;
  firstClientIdeaReceived: boolean = false;

  constructor(private queueService: QueueService,
              private dialog: MatDialog, private canObjServ: CanvasObjectService) {
  }

  ngOnInit(): void {
    this.subscribeToClientChannel();
    this.subscribeToPresenterChannel();
  }

  ngOnDestroy() {
    if (this.canvasObjectsSubscription) {
      this.canvasObjectsSubscription?.unsubscribe();
    }
  }

  initializeComponent(data: PresenterMessage): void {
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
    this.initializeTimer();
    this.ideaEvent.ideas.map((idea) => {
      this.canObjServ.objectAdded.emit({
        text: idea,
        color: '#ffd707ff',
        hasVisibleContent: true,
        type: "stickyNote",
        presenter: true
      });
    });
  }

  private subscribeToClientChannel(): void {
    this.queueService.listenToClientChannel<BrainstormingClientSubscribeResponse>(
      (brainstormingSubscriptionEvent) => {
        if (!this.ideaEvent) {
          console.error(
            'Error: idea event was not populated by parent client component'
          );
          return;
        }
        this.handleClientChannelEvent(brainstormingSubscriptionEvent);
      },
      'BrainstormingPresenterComponent.ngOnInit'
    );
  }

  private handleClientChannelEvent(brainstormingSubscriptionEvent: BrainstormingClientSubscribeResponse) {
    if (this.isMatchingQuestion(brainstormingSubscriptionEvent)) {
      if (this.stage === 'brainstorming') {
        this.addBrainstormingIdea(brainstormingSubscriptionEvent);
      } else if (this.stage === 'voting') {
        this.updateVotes(brainstormingSubscriptionEvent);
      }
    }
  }

  private isMatchingQuestion(brainstormingSubscriptionEvent: BrainstormingClientSubscribeResponse): boolean {
    return !!(
      this.ideaEvent &&
      this.ideaEvent.questionID === brainstormingSubscriptionEvent.questionID
    );
  }

  private addBrainstormingIdea(brainstormingSubscriptionEvent: BrainstormingClientSubscribeResponse): void {
    this.firstClientIdeaReceived = true;
    this.canObjServ.objectAdded.emit({
      text: brainstormingSubscriptionEvent.ideaText,
      color: brainstormingSubscriptionEvent.stickyColor,
      hasVisibleContent: this.stickyContentVisible,
      type: brainstormingSubscriptionEvent.type,
      presenter: false
    });
  }

  private updateVotes(event: BrainstormingClientSubscribeResponse): void {
    this.ideaResponses.forEach((_, index) => {
      if (this.votes) {
        this.votes[index] += event.ideaVoting[index];
        this.updateVoteCounterOnCanvas(index);
      }
    });
  }

  private updateVoteCounterOnCanvas(index: number): void {
    const groupObjects = this.getGroupObjectsOnCanvas();

    groupObjects.forEach((group, groupIndex) => {
      if (this.votes[groupIndex] !== 0 && groupIndex === index) {
        this.updateVoteCounterOnGroup(group, index);
      }
    });
  }

  private getGroupObjectsOnCanvas(): fabric.Group[] {
    const objects = this.canvas?.getObjects() || [];
    return objects.filter(obj => obj.type === 'group') as fabric.Group[];
  }

  private updateVoteCounterOnGroup(group: fabric.Group, index: number): void {
    const textObjectsInGroup = this.getTextObjectsInGroup(group);

    textObjectsInGroup.forEach(textObj => {
      textObj.set('text', `${this.votes[index]}`);
    });

    this.canvas?.renderAll();
  }

  private getTextObjectsInGroup(group: fabric.Group): fabric.Text[] {
    const groupObjects = group.getObjects();
    return groupObjects
      .filter(groupItem => groupItem.type === 'group')
      .flatMap(groupItem => (groupItem as fabric.Group).getObjects())
      .filter(item => item.type === 'text') as fabric.Text[];
  }

  private subscribeToPresenterChannel(): void {
    this.queueService.listenToPresenterChannel<BrainstormingPresenterStatusVotingRequest>(
      (response) => {
        this.handlePresenterChannelEvent(response);
      },
      'BrainstormingPresenterComponent.ngOnInit'
    );
  }

  private handlePresenterChannelEvent(response: BrainstormingPresenterStatusVotingRequest) {
    if (this.hasVotingStarted(response)) {
      this.updateTimer(response);
      this.initializeTimer();
    }
  }

  private hasVotingStarted(response: BrainstormingPresenterStatusVotingRequest) {
    return !!(
      this.ideaEvent &&
      response.clientOnly &&
      (this.stage === 'voting' || this.stage === 'brainstorming')
    );
  }

  private updateTimer(response: BrainstormingPresenterStatusVotingRequest): void {
    if (this.ideaEvent) {
      this.ideaEvent.timer = response.timer;
    }
  }

  startBrainstorming(): void {
    if (!this.ideaEvent?.questionID) return;
    this.stage = 'brainstorming';
    const payload: BrainstormingPresenterPublishRequest = {
      openForIdeas: true,
      interaction: 'brainstorming',
      question: this.ideaEvent?.question,
      questionID: this.ideaEvent.questionID,
      clientOnly: true,
    };
    if (this.timerLengthBrainstorming) {
      payload.timer = this.timerLengthBrainstorming;
    }
    this.queueService.publishMessageToPresenterChannel(payload);
  }

  stopBrainstorming(): void {
    if (!this.ideaEvent?.questionID) return;
    const payload: BrainstormingPresenterPublishRequest = {
      openForIdeas: false,
      interaction: 'brainstorming',
      question: this.ideaEvent?.question,
      questionID: this.ideaEvent.questionID,
      clientOnly: true,
    };
    clearInterval(this.timerInterval);
    this.ideaEvent.timer = undefined;
    this.queueService.publishMessageToPresenterChannel(payload);
    this.stage = 'afterBrainstorming';
  }

  startVoting(): void {
    this.canvas?.getObjects().forEach(obj => {
      obj.selectable = false;
    })
    this.subscribeCanvasObjects();
    this.emitCanvasRequest();
    this.toggleVotingCounterVisibility();
  }

  private subscribeCanvasObjects(): void {
    this.canvasObjectsSubscription = this.canObjServ.sendCanvas.subscribe((obj) => {
      this.extractIdeaResponsesFromCanvas(obj);
      this.initializeVotingStage();
    });
  }

  private extractIdeaResponsesFromCanvas(obj: { canvas: fabric.Canvas }): void {
    this.canvas = obj.canvas;
    this.canvas.selection = false;
    this.canvas.getObjects().forEach((obj) => {
      obj.evented = false;
      if (obj.type === 'group') {
        let group = obj as fabric.Group;
        group.getObjects().forEach(groupItem => {
          if (groupItem instanceof FixedSizeTextbox) {
            this.ideaResponses.push(groupItem.text!);
            console.log(groupItem, "was added to the ideaResponses from Canvas.");
          }
        });
      }
    });
  }

  private initializeVotingStage(): void {
    if (!this.ideaEvent?.questionID) return;

    this.stage = 'voting';
    this.votes = Array(this.ideaResponses.length).fill(0);
    const groupObjects = this.getGroupObjectsOnCanvas();
    groupObjects.forEach((group, groupIndex) => {
      this.updateVoteCounterOnGroup(group, groupIndex);
    });

    this.sendVotingRequestToPresenter();
  }

  private sendVotingRequestToPresenter(): void {
    const payload: BrainstormingPresenterStatusVotingRequest = this.constructVotingRequestPayload();
    this.queueService.publishMessageToPresenterChannel(payload);
  }

  private constructVotingRequestPayload(): BrainstormingPresenterStatusVotingRequest {
    const payload: BrainstormingPresenterStatusVotingRequest = {
      interaction: 'brainstorming',
      ideas: this.ideaResponses,
      question: this.ideaEvent?.question!,
      questionID: this.ideaEvent?.questionID!,
      singleChoice: this.isSingleChoice,
      votingInProgress: true,
      clientOnly: true,
    };

    if (this.timerLengthVoting) {
      payload.timer = this.timerLengthVoting;
    }

    return payload;
  }

  private emitCanvasRequest(): void {
    this.canObjServ.requestCanvas.emit();
  }

  private toggleVotingCounterVisibility(): void {
    this.getGroupObjectsOnCanvas().forEach((obj) => {
      obj.getObjects("group").forEach((obj) => {
        if (obj.name === "votingCounter") {
          obj.visible = true;
          this.canvas?.renderAll();
        }
      })
    })
  }

  toggleAllStickies(): void {
    this.stickyContentVisible = !this.stickyContentVisible;
    this.canObjServ.toggleTextVisibility.emit({textVisible: this.stickyContentVisible});
  }

  stopVoting() {
    this.canvas?.getObjects().forEach(obj => {
      obj.evented = true;
    })
    this.canvas!.selection = true;
    this.canvasObjectsSubscription?.unsubscribe();

    if (!this.ideaEvent?.questionID) return;
    const payload: BrainstormingPresenterStatusVotingRequest = {
      interaction: 'brainstorming',
      question: this.ideaEvent?.question,
      questionID: this.ideaEvent?.questionID,
      singleChoice: false,
      votingInProgress: false,
      clientOnly: true,
    };
    this.stage = 'afterBrainstorming';
    clearInterval(this.timerInterval);
    this.ideaEvent.timer = 0;
    this.queueService.publishMessageToPresenterChannel(payload);
    this.ideaResponses = [];
  }

  private initializeTimer() {
    if (this.ideaEvent?.timer) {
      this.timerInterval = setInterval(() => {
        if (this.ideaEvent && this.ideaEvent.timer) {
          this.ideaEvent.timer -= 1;
          if (this.ideaEvent.timer <= 0) {
            if (this.stage === 'voting') {
              this.stopVoting();
            } else if (this.stage === 'brainstorming') {
              this.stopBrainstorming();
              this.ideaEvent.timer = 0;
            }
            clearInterval(this.timerInterval);
          }
        }
      }, 1000);
    }
  }

  addSticky() {
    this.canObjServ.objectAdded.emit({
      text: "",
      color: "",
      hasVisibleContent: true,
      type: "stickyNote",
      presenter: true
    });
  }

  openBrainstormingTimerDialog() {
    const dialogRef = this.dialog.open(TimerPopupComponent, {
      data: {stage: "brainstorming"},
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.choice) {
        this.timerLengthBrainstorming = result.timer;
        this.startBrainstorming();
      }
    });
  }

  openVotingDialog() {
    const dialogRef = this.dialog.open(TimerPopupComponent, {
      data: {stage: "voting"},
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.choice) {
        this.isSingleChoice = !result.isMultivote;
        this.timerLengthVoting = result.timer;
        this.startVoting();
      }
    });
  }
}
