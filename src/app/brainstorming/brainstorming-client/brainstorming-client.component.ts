import {AfterViewChecked, Component} from '@angular/core';
import {ClientView} from "../../client-view";
import {PresenterMessage} from "../../presenter-message";
import {BrainstormingPresenterSubscribeResponse} from "../brainstorming-presenter-subscribe-response";
import {GroupService} from "../../group.service";
import {QueueService} from "../../queue.service";
import {ParticipantService} from "../../participant.service";
import {BrainstormingClientPublishRequest} from "../brainstorming-client-publish-request";
import {BrainstormingPresenterVotingSubscribeResponse} from "../brainstorming-presenter-voting-subscribe-response";
import {BrainstormigClientVotingPublishRequest} from "../brainstormig-client-voting-publish-request";


@Component({
  selector: 'app-brainstorming-client',
  templateUrl: './brainstorming-client.component.html',
  styleUrls: ['./brainstorming-client.component.css']
})
export class BrainstormingClientComponent implements ClientView,AfterViewChecked {
  ideaEvent ?: BrainstormingPresenterSubscribeResponse;
  votingEvent ?: BrainstormingPresenterVotingSubscribeResponse;
  openForIdeas: boolean = false;
  isAfterBrainstorming: boolean = false;
  idea_text: string = "";
  is_sent: boolean = false;
  is_voted: boolean = false;
  multi_vote_check: boolean [];
  stickyColor: string = "#FFD707FF"
  bgColor: string = "#ffd707F";

  constructor(private groupService: GroupService,
              private queueService: QueueService,
              private participantService: ParticipantService) {
    this.multi_vote_check = Array(this.votingEvent?.ideas.length).fill(false);
  }

  ngAfterViewChecked(): void {
    const sticky = document.querySelector('#user-input');
    if(sticky) {
      this.resizeTextToFitContainer(sticky as HTMLElement);
    }
  }

  voteForIdea(voteSelectionIndex: number) {
    if (!this.votingEvent?.ideas) return

    // handle idea-vote
    const voting: number[] = Array(this.votingEvent.ideas.length).fill(0);
    voting[voteSelectionIndex] = 1;
    const message: BrainstormigClientVotingPublishRequest = {
      interaction: "brainstorming",
      idea_voting: voting,
      participantName: this.participantService.getParticipantName(),
      question_id: this.votingEvent.question_id

    };
    this.queueService.publishMessageToClientChannel<BrainstormigClientVotingPublishRequest>(message);
    if (this.votingEvent.single_choice) {
      this.is_voted = true;
    }else {
      this.multi_vote_check[voteSelectionIndex] = true;
    }

  }

  sendIdea() {
    if (!this.ideaEvent?.question_id) return

    const idea: BrainstormingClientPublishRequest = {
      interaction: "brainstorming",
      idea_text: this.idea_text,
      participantName: this.participantService.getParticipantName(),
      question_id: this.ideaEvent.question_id,
      stickyColor: this.stickyColor
    };

    this.queueService.publishMessageToClientChannel<BrainstormingClientPublishRequest>(idea);

    this.idea_text = "";
    this.is_sent = true;

    setTimeout(() => {
      this.is_sent = false
    }, 1000)
  }

  initializeComponent(data: PresenterMessage) {
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
    this.votingEvent = data as BrainstormingPresenterVotingSubscribeResponse;
    if (this.ideaEvent.openForIdeas) {
      this.openForIdeas = true;
    } else if (this.ideaEvent.openForIdeas === false)  {
      this.isAfterBrainstorming = true;
    }
    this.initializeTimer();
  }

  private initializeTimer() {
    if (this.votingEvent?.timer) {
      const timerInterval = setInterval(() => {
        if (this.votingEvent && this.votingEvent.timer) {
          this.votingEvent.timer -= 1;
          if (this.votingEvent.timer <= 0) {
            clearInterval(timerInterval);
          }
        }
      }, 1000);
    }
  }

  changeColor(event : MouseEvent) {
    const element = event.target as HTMLElement;
    const colorSpans = document.querySelectorAll('.color-selection span') as NodeListOf<HTMLElement>;

    // Loop over all color spans to remove the 'active' class from their classList
    colorSpans.forEach(span => {
      if (span !== element) {
        span.classList.remove('active');
      }
    });

    // Add the 'active' class to the clicked element's classList
    element.classList.add('active');
    this.bgColor = getComputedStyle(element).getPropertyValue('background-color');
    this.stickyColor = getComputedStyle(element).getPropertyValue('background-color');
  }

  resizeTextToFitContainer(element: HTMLElement) {
    const maxWidth = element.clientWidth;
    const maxHeight = element.clientHeight;

    let minFontSize = 5; // Set a minimum font size
    let maxFontSize = 50; // Set a maximum font size
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
}
