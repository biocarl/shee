import {AfterViewChecked, Component, OnInit} from '@angular/core';
import {PresenterView} from "../../presenter-view";
import {PresenterMessage} from "../../presenter-message";
import {BrainstormingPresenterSubscribeResponse} from "../brainstorming-presenter-subscribe-response";
import {QueueService} from "../../queue.service";
import {BrainstormingClientSubscribeResponse} from "../brainstorming-client-subscribe-response";
import {BrainstormingPresenterStatusVotingRequest} from "../brainstorming-presenter-status-voting-request";
import {CdkDragStart} from '@angular/cdk/drag-drop';
import {BrainstormingPresenterPublishRequest} from "../brainstorming-presenter-publish-request";


@Component({
  selector: 'app-brainstorming-presenter',
  templateUrl: './brainstorming-presenter.component.html',
  styleUrls: ['./brainstorming-presenter.component.css']
})

export class BrainstormingPresenterComponent implements PresenterView, OnInit, AfterViewChecked {
  ideaEvent ?: BrainstormingPresenterSubscribeResponse;
  votes?: number[];
  timerLength_voting?: number;
  maxZIndex = 20;
  chosenColor: string = "#FFD707FF";
  private timerInterval: any;
  timerLength_brainstorming?: number;
  stage: 'initial' | 'brainstorming' | 'afterBrainstorming' | 'voting' = 'initial';


  constructor(private queueService: QueueService) {
  }

  ngAfterViewChecked(): void {
    const stickies = document.querySelectorAll('.sticky');

    stickies.forEach(sticky => {
      this.resizeTextToFitContainer(sticky as HTMLElement);
    });
  }

  ngOnInit(): void {
    this.queueService.listenToClientChannel<BrainstormingClientSubscribeResponse>(brainstormingSubscriptionEvent => {
      if (!this.ideaEvent) {
        console.error("Error: idea event was not populated by parent client component");
        return;
      }
      if (this.ideaEvent.question_id == brainstormingSubscriptionEvent.question_id && this.stage === 'brainstorming') {
        this.ideaEvent.ideas.push(brainstormingSubscriptionEvent.idea_text);

      } else if (this.ideaEvent.question_id == brainstormingSubscriptionEvent.question_id && brainstormingSubscriptionEvent.idea_voting && this.stage === 'voting') {
        this.votes = this.votes?.map((total, index) => total + brainstormingSubscriptionEvent.idea_voting[index])
      }
    });

    this.queueService.listenToPresenterChannel<BrainstormingPresenterStatusVotingRequest>(response => {
      if (response.client_only && (this.stage === 'voting' || this.stage === 'brainstorming') && this.ideaEvent) {
        this.ideaEvent.timer = response.timer;
        this.initializeTimer();
      }
    });
  }


  initializeComponent(data: PresenterMessage): void {
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
    if (!this.ideaEvent.ideas) {
      this.ideaEvent.ideas = [];
    }
    this.initializeTimer();
  }

  startBrainstorming(): void {
    if (!this.ideaEvent?.question_id) return
    this.stage = 'brainstorming';
    const payload: BrainstormingPresenterPublishRequest = {
      openForIdeas: true,
      interaction: "brainstorming",
      question: this.ideaEvent?.question,
      question_id: this.ideaEvent.question_id,
      client_only: true
    };
    if (this.timerLength_brainstorming) {
      payload.timer = this.timerLength_brainstorming;
    }
    this.queueService.publishMessageToPresenterChannel(payload);
  }

  stopBrainstorming(): void {
    if (!this.ideaEvent?.question_id) return
    const payload: BrainstormingPresenterPublishRequest = {
      openForIdeas: false,
      interaction: "brainstorming",
      question: this.ideaEvent?.question,
      question_id: this.ideaEvent.question_id,
      client_only: true
    };
    clearInterval(this.timerInterval)
    this.ideaEvent.timer = 0;
    this.queueService.publishMessageToPresenterChannel(payload);
    this.stage = 'afterBrainstorming';
  }

  resizeTextToFitContainer(element: HTMLElement) {
    const maxWidth = element.clientWidth;
    const maxHeight = element.clientHeight;

    let minFontSize = 5; // Set a minimum font size
    let maxFontSize = 36; // Set a maximum font size
    let fontSize = maxFontSize;

    // Apply the maximum font size
    element.style.fontSize = fontSize + 'px';

    // Reduce the font size until the content fits or reaches the minimum size
    while ((element.scrollHeight > maxHeight || element.scrollWidth > maxWidth) && fontSize > minFontSize) {
      fontSize--;
      element.style.fontSize = fontSize + 'px';
    }

    // Increase the font size until the content overflows or reaches the maximum size
    while ((element.scrollHeight <= maxHeight && element.scrollWidth <= maxWidth) && fontSize < maxFontSize) {
      fontSize++;
      element.style.fontSize = fontSize + 'px';

      if (element.scrollHeight > maxHeight || element.scrollWidth > maxWidth) {
        fontSize--;
        element.style.fontSize = fontSize + 'px';
        break;
      }
    }
  }

  moveToTopLayerWhenDragged(event: CdkDragStart) {
    const element = event.source.getRootElement();
    const stickyElement = element.querySelector('.sticky') as HTMLElement;
    const shadowElement = element.querySelector('.shadow') as HTMLElement;
    const postItElement = stickyElement.parentElement;
    const tapeElement = element.querySelector('.top-tape') as HTMLElement;
    const iconsElement = element.querySelector('.icon-container') as HTMLElement;

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
      this.ideaEvent?.ideas.splice(i, 1, "");
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

  startVoting(): void {
    if (!this.ideaEvent?.question_id) return
    const votingOption = document.getElementById('votingOption') as HTMLSelectElement;
    const selectedOption = votingOption.value;
    let singleChoice: boolean = selectedOption === 'oneVote';
    let finalIdeas: string[] = this.ideaEvent.ideas.filter(idea => idea !== "");
    this.stage = 'voting';
    this.votes = Array(this.ideaEvent.ideas.length).fill(0);
    const payload: BrainstormingPresenterStatusVotingRequest = {
      interaction: "brainstorming",
      ideas: finalIdeas,
      question: this.ideaEvent?.question,
      question_id: this.ideaEvent.question_id,
      single_choice: singleChoice,
      voting_in_progress: true,
      client_only: true
    };
    if (this.timerLength_voting) {
      payload.timer = this.timerLength_voting;
    }
    this.queueService.publishMessageToPresenterChannel(payload);
  }

  stopVoting() {
    if (!this.ideaEvent?.question_id) return
    const payload: BrainstormingPresenterStatusVotingRequest = {
      interaction: "brainstorming",
      ideas: this.ideaEvent.ideas,
      question: this.ideaEvent?.question,
      question_id: this.ideaEvent?.question_id,
      single_choice: false,
      voting_in_progress: false,
      client_only: true
    };
    this.stage = 'afterBrainstorming';
    clearInterval(this.timerInterval)
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
            }
            clearInterval(this.timerInterval);
          }
        }
      }, 1000);
    }
  }
}
