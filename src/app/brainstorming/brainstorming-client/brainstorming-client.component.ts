import {AfterViewChecked, Component} from '@angular/core';
import {PresenterMessage} from "../../presenter-message";
import {BrainstormingPresenterSubscribeResponse} from "../brainstorming-presenter-subscribe-response";
import {GroupService} from "../../group.service";
import {QueueService} from "../../queue.service";
import {ParticipantService} from "../../participant.service";
import {BrainstormingClientPublishRequest} from "../brainstorming-client-publish-request";
import {BrainstormingPresenterVotingSubscribeResponse} from "../brainstorming-presenter-voting-subscribe-response";
import {BrainstormigClientVotingPublishRequest} from "../brainstormig-client-voting-publish-request";
import {View} from "../../view";


@Component({
  selector: 'app-brainstorming-client',
  templateUrl: './brainstorming-client.component.html',
  styleUrls: ['./brainstorming-client.component.css']
})
export class BrainstormingClientComponent implements View,AfterViewChecked {
  ideaEvent ?: BrainstormingPresenterSubscribeResponse;
  votingEvent ?: BrainstormingPresenterVotingSubscribeResponse;
  openForIdeas: boolean = false;
  isAfterBrainstorming: boolean = false;
  ideaText: string = "";
  isSent: boolean = false;
  isVoted: boolean = false;
  multiVoteCheck: boolean [];
  stickyColor: string = "#FFD707FF"
  bgColor: string = "#ffd707F";

  constructor(private groupService: GroupService,
              private queueService: QueueService,
              private participantService: ParticipantService) {
    this.multiVoteCheck = Array(this.votingEvent?.ideas.length).fill(false);
  }

  ngAfterViewChecked(): void {
    this.resizeTextToFitContainer('#user-input');
  }

  voteForIdea(voteSelectionIndex: number) {
    if (!this.votingEvent?.ideas) return
    // handle idea-vote
    const voting: number[] = Array(this.votingEvent.ideas.length).fill(0);
    voting[voteSelectionIndex] = 1;
    const message: BrainstormigClientVotingPublishRequest = {
      interaction: "brainstorming",
      ideaVoting: voting,
      participantName: this.participantService.getParticipantName(),
      questionID: this.votingEvent.questionID
    };
    this.queueService.publishMessageToClientChannel<BrainstormigClientVotingPublishRequest>(message);
    if (this.votingEvent.singleChoice) {
      this.isVoted = true;
    } else {
      this.multiVoteCheck[voteSelectionIndex] = true;
    }

  }

  sendIdea() {
    if (!this.ideaEvent?.questionID) return

    const idea: BrainstormingClientPublishRequest = {
      interaction: "brainstorming",
      ideaText: this.ideaText,
      participantName: this.participantService.getParticipantName(),
      questionID: this.ideaEvent.questionID,
      stickyColor: this.stickyColor,
      type: "stickyNote"
    };

    this.queueService.publishMessageToClientChannel<BrainstormingClientPublishRequest>(idea);

    this.ideaText = "";
    this.isSent = true;

    setTimeout(() => {
      this.isSent = false
    }, 1000)
  }

  initializeComponent(data: PresenterMessage) {
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
    this.votingEvent = data as BrainstormingPresenterVotingSubscribeResponse;
    if (this.ideaEvent.openForIdeas) {
      this.openForIdeas = true;
    } else if (this.ideaEvent.openForIdeas === false) {
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

  changeColor(event: MouseEvent) {
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

  // resizeTextToFitContainer(selector: string) {
  //   const sticky: HTMLElement | null = document.querySelector(selector);
  //   if (sticky) {
  //     const maxWidth = sticky.clientWidth;
  //     const maxHeight = sticky.clientHeight;
  //     sticky.style.fontFamily = "'Lato','sans-serif'";
  //     sticky.style.fontWeight = "500";
  //
  //     let minFontSize = 5; // Set a minimum font size
  //     let maxFontSize = 200; // Set a maximum font size
  //     let fontSize = maxFontSize;
  //
  //     // Apply the maximum font size
  //     sticky.style.fontSize = fontSize + 'px';
  //
  //     // Reduce the font size until the content fits or reaches the minimum size
  //     while ((sticky.scrollHeight > maxHeight || sticky.scrollWidth > maxWidth) && fontSize > minFontSize) {
  //       fontSize--;
  //       sticky.style.fontSize = fontSize + 'px';
  //     }
  //
  //     // Increase the font size until the content overflows or reaches the maximum size
  //     while ((sticky.scrollHeight <= maxHeight && sticky.scrollWidth <= maxWidth) && fontSize < maxFontSize) {
  //       fontSize++;
  //       sticky.style.fontSize = fontSize + 'px';
  //
  //       if (sticky.scrollHeight > maxHeight || sticky.scrollWidth > maxWidth) {
  //         fontSize--;
  //         sticky.style.fontSize = fontSize + 'px';
  //         break;
  //       }
  //     }
  //   }
  // }
  resizeTextToFitContainer(selector: string) {
    const sticky: HTMLElement | null = document.querySelector(selector);
    if (sticky) {
      const maxWidth = sticky.clientWidth;
      const maxHeight = sticky.clientHeight;
      sticky.style.fontFamily = "'Lato','sans-serif'";
      sticky.style.fontWeight = "500";

      let minFontSize = 5; // Set a minimum font size
      let maxFontSize = 200; // Set a maximum font size
      let fontSize = maxFontSize;

      // Apply the maximum font size
      sticky.style.fontSize = fontSize + 'px';

      // Reduce the font size until the content fits or reaches the minimum size
      while ((sticky.scrollHeight > maxHeight || sticky.scrollWidth > maxWidth) && fontSize > minFontSize) {
        fontSize--;
        sticky.style.fontSize = fontSize + 'px';
      }

      // Increase the font size until the content overflows or reaches the maximum size
      while ((sticky.scrollHeight <= maxHeight && sticky.scrollWidth <= maxWidth) && fontSize < maxFontSize) {
        fontSize++;
        sticky.style.fontSize = fontSize + 'px';

        if (sticky.scrollHeight > maxHeight || sticky.scrollWidth > maxWidth) {
          fontSize--;
          sticky.style.fontSize = fontSize + 'px';
          break;
        }
      }
    }
  }

}
