import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { PresenterMessage } from '../../presenter-message';
import { BrainstormingPresenterSubscribeResponse } from '../brainstorming-presenter-subscribe-response';
import { QueueService } from '../../queue.service';
import { BrainstormingClientSubscribeResponse } from '../brainstorming-client-subscribe-response';
import { CdkDragStart } from '@angular/cdk/drag-drop';
import { BrainstormingPresenterStatusVotingRequest } from '../brainstorming-presenter-status-voting-request';
import { BrainstormingPresenterPublishRequest } from '../brainstorming-presenter-publish-request';
import { View } from '../../view';
import { MatDialog } from '@angular/material/dialog';
import { TimerPopupComponent } from './timer-popup/timer-popup.component';

@Component({
  selector: 'app-brainstorming-presenter',
  templateUrl: './brainstorming-presenter.component.html',
  styleUrls: ['./brainstorming-presenter.component.css'],
})
export class BrainstormingPresenterComponent
  implements View, OnInit, AfterViewChecked
{
  ideaEvent?: BrainstormingPresenterSubscribeResponse;
  ideaResponses: { text: string; color: string; hasVisibleContent: boolean }[] =
    [];
  maxZIndex = 20;
  stickyContentVisible: boolean = false;
  votes?: number[];
  timerLengthVoting?: number;
  private timerInterval: any;
  timerLengthBrainstorming?: number;
  stage: 'initial' | 'brainstorming' | 'afterBrainstorming' | 'voting' =
    'initial';
  editing: boolean = false;
  editableSticky?: number;
  editedIdea: string = '';

  constructor(private queueService: QueueService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.subscribeToClientChannel();
    this.subscribeToPresenterChannel();
  }

  ngAfterViewChecked(): void {
    this.resizeTextToFitContainer('.sticky');
  }

  initializeComponent(data: PresenterMessage): void {
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
    this.initializeTimer();
    this.ideaEvent.ideas.map((idea, index) => {
      if (this.ideaEvent) {
        this.ideaResponses.push({
          text: idea,
          color: '#ffd707ff',
          hasVisibleContent: true,
        });
      }
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

  private handleClientChannelEvent(
    brainstormingSubscriptionEvent: BrainstormingClientSubscribeResponse
  ) {
    if (this.isMatchingQuestion(brainstormingSubscriptionEvent)) {
      if (this.stage === 'brainstorming') {
        this.addBrainstormingIdea(brainstormingSubscriptionEvent);
      } else if (this.stage === 'voting') {
        this.updateVotes(brainstormingSubscriptionEvent);
      }
    }
  }

  private isMatchingQuestion(
    brainstormingSubscriptionEvent: BrainstormingClientSubscribeResponse
  ): boolean {
    return !!(
      this.ideaEvent &&
      this.ideaEvent.questionID === brainstormingSubscriptionEvent.questionID
    );
  }

  private addBrainstormingIdea(
    brainstormingSubscriptionEvent: BrainstormingClientSubscribeResponse
  ): void {
    this.ideaResponses.push({
      text: brainstormingSubscriptionEvent.ideaText,
      color: brainstormingSubscriptionEvent.stickyColor,
      hasVisibleContent: this.stickyContentVisible,
    });
  }

  private updateVotes(
    brainstormingSubscriptionEvent: BrainstormingClientSubscribeResponse
  ): void {
    let voteIndex = 0;
    this.ideaResponses.forEach((idea, index) => {
      if (idea.text !== '' && this.votes) {
        this.votes[index] +=
          brainstormingSubscriptionEvent.ideaVoting[voteIndex];
        voteIndex++;
      }
    });
  }

  private subscribeToPresenterChannel(): void {
    this.queueService.listenToPresenterChannel<BrainstormingPresenterStatusVotingRequest>(
      (response) => {
        this.handlePresenterChannelEvent(response);
      },
      'BrainstormingPresenterComponent.ngOnInit'
    );
  }

  private handlePresenterChannelEvent(
    response: BrainstormingPresenterStatusVotingRequest
  ) {
    if (this.hasVotingStarted(response)) {
      this.updateTimer(response);
      this.initializeTimer();
    }
  }

  private hasVotingStarted(
    response: BrainstormingPresenterStatusVotingRequest
  ) {
    return !!(
      this.ideaEvent &&
      response.clientOnly &&
      (this.stage === 'voting' || this.stage === 'brainstorming')
    );
  }

  private updateTimer(
    response: BrainstormingPresenterStatusVotingRequest
  ): void {
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

  resizeTextToFitContainer(selector: string) {
    const stickies: NodeListOf<HTMLElement> =
      document.querySelectorAll(selector);
    stickies.forEach((element) => {
      const maxWidth = element.clientWidth;
      const maxHeight = element.clientHeight;

      let minFontSize = 5; // Set a minimum font size
      let maxFontSize = 50; // Set a maximum font size
      let fontSize = maxFontSize;

      // Apply the maximum font size
      element.style.fontSize = fontSize + 'px';

      // Reduce the font size until the content fits or reaches the minimum size
      while (
        (element.scrollHeight > maxHeight || element.scrollWidth > maxWidth) &&
        fontSize > minFontSize
      ) {
        fontSize--;
        element.style.fontSize = fontSize + 'px';
      }

      // Increase the font size until the content overflows or reaches the maximum size
      while (
        element.scrollHeight <= maxHeight &&
        element.scrollWidth <= maxWidth &&
        fontSize < maxFontSize
      ) {
        fontSize++;
        element.style.fontSize = fontSize + 'px';

        if (
          element.scrollHeight > maxHeight ||
          element.scrollWidth > maxWidth
        ) {
          fontSize--;
          element.style.fontSize = fontSize + 'px';
          break;
        }
      }
    });
  }

  startVoting(): void {
    if (!this.ideaEvent?.questionID) return;
    const votingOption = document.getElementById(
      'votingOption'
    ) as HTMLSelectElement;
    const selectedOption = votingOption.value;
    let singleChoice: boolean = selectedOption === 'oneVote';
    let finalIdeas: string[] = this.ideaResponses
      .map((idea) => idea.text)
      .filter((idea) => idea !== '');
    this.stage = 'voting';
    this.votes = Array(this.ideaResponses.length).fill(0);
    const payload: BrainstormingPresenterStatusVotingRequest = {
      interaction: 'brainstorming',
      ideas: finalIdeas,
      question: this.ideaEvent?.question,
      questionID: this.ideaEvent.questionID,
      singleChoice: singleChoice,
      votingInProgress: true,
      clientOnly: true,
    };
    if (this.timerLengthVoting) {
      payload.timer = this.timerLengthVoting;
    }
    this.queueService.publishMessageToPresenterChannel(payload);
  }

  moveToTopLayerWhenDragged(event: CdkDragStart) {
    const element = event.source.getRootElement();
    const stickyElement = element.querySelector('.sticky') as HTMLElement;
    const shadowElement = element.querySelector('.shadow') as HTMLElement;
    const postItElement = stickyElement.parentElement;
    const tapeElement = element.querySelector('.top-tape') as HTMLElement;
    const iconsElement = element.querySelector(
      '.icon-container'
    ) as HTMLElement;

    if (stickyElement && stickyElement.parentElement && postItElement) {
      postItElement.style.zIndex = (++this.maxZIndex).toString();
      stickyElement.style.zIndex = (++this.maxZIndex).toString();
    }

    if (shadowElement) {
      shadowElement.style.zIndex = (this.maxZIndex - 1).toString();
    }

    if (tapeElement) {
      tapeElement.style.zIndex = (this.maxZIndex + 1).toString();
    }
    if (iconsElement) {
      iconsElement.style.zIndex = (this.maxZIndex + 1).toString();
    }
  }

  hideIdea(i: number) {
    if (i > -1) {
      this.ideaResponses.splice(i, 1, {
        text: '',
        color: '',
        hasVisibleContent: false,
      });
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  showCopiedMessage(element: HTMLElement) {
    element.style.opacity = '1';
    setTimeout(() => {
      element.style.opacity = '0';
    }, 1200);
  }

  toggleAllStickies(): void {
    this.stickyContentVisible = !this.stickyContentVisible;
    this.ideaResponses.forEach((idea) => {
      idea.hasVisibleContent = this.stickyContentVisible;
    });
  }

  stopVoting() {
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

  addStickie() {
    this.ideaResponses.push({
      text: 'new idea',
      color: '#ffd707ff',
      hasVisibleContent: true,
    });
    this.editing = !this.editing;
    if (this.ideaEvent) {
      this.editableSticky = this.ideaResponses.length - 1;
    }
  }

  toggleEditMode(index: number) {
    this.editing = true;
    this.editableSticky = index;
    if (this.ideaEvent) {
      this.editedIdea = this.ideaResponses[index].text;
    }
  }

  saveIdea(index: number) {
    this.ideaResponses[index].text = this.editedIdea;
    this.editing = false;
    this.editedIdea = '';
  }

  openTimerDialog() {
    const dialogRef = this.dialog.open(TimerPopupComponent, {
      data: { timer: this.timerLengthBrainstorming },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(
        'Result: ' + result + ' Timerlength: ' + this.timerLengthBrainstorming
      );
      if (result.choice) {
        this.timerLengthBrainstorming = result.timer;
        console.log(
          'Choice: ' + result.choice + ' Timerlength: ' + this.timerLengthBrainstorming
        );
        this.startBrainstorming();
      }
    });
  }
}
