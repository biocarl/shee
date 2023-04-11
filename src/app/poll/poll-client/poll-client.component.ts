import {Component} from '@angular/core';
import {GroupService} from "../../group.service";
import {QueueService} from "../../queue.service";
import {PollPresenterSubscribeResponse} from "../poll-presenter-subscribe-response";
import {PollClientPublishRequest} from "../poll-client-publish-request";
import {ClientView} from "../../client-view";
import {PresenterMessage} from "../../presenter-message";
import {ParticipantService} from "../../participant.service";

@Component({
  selector: 'app-vote-selector',
  templateUrl: './poll-client.component.html',
  styleUrls: ['./poll-client.component.css']
})
/**
 * The PollClientComponent is used to display the poll interaction view and interact with the presenter.
 * @component
 * @implements ClientView
 */
export class PollClientComponent implements ClientView {
  /**
   * The poll event to be displayed to the user.
   * @public
   * @type {PollPresenterSubscribeResponse | undefined}
   */
  questionEvent ? : PollPresenterSubscribeResponse;
  /**
   * A flag to indicate whether the user has already voted or not.
   * @public
   * @type {boolean}
   */
  voted: boolean = false;

  /**
   The constructor of the PollClientComponent class.
   @constructor
   @param {GroupService} groupService - The GroupService used to retrieve the group name.
   @param {QueueService} queueService - The QueueService used to publish messages to the client channel.
   @param {ParticipantService} participantService - The ParticipantService used to retrieve the participant name.
   */
  constructor(private groupService : GroupService, private queueService : QueueService, private participantService: ParticipantService) {}

  /**
   * Sends the user's vote to the presenter via ntfy.
   * @public
   * @param {number} voteSelectionIndex The index of the selected answer.
   * @returns {void}
   * @usageNotes
   * This method is called when the user selects an answer to vote for.
   * It sends the user's vote to the server via a message with type `PollClientPublishRequest`.
   */
  voteForQuestion(voteSelectionIndex: number) {
    if(!this.questionEvent?.answers) return
    // You can't vote twice
    this.voted = true;
    this.groupService.hasQuestions = false;

    // handle vote
    const voting : number[] = Array(this.questionEvent.answers.length).fill(0);
    voting[voteSelectionIndex] = 1;
    const message : PollClientPublishRequest =  {
        interaction: "poll",
        question_id: this.questionEvent.id,
        voting : voting,
        participantName : this.participantService.getParticipantName()
      };
    this.queueService.publishMessageToClientChannel<PollClientPublishRequest>(message);
  }

  /**
   * Initializes the component with the poll event received from the presenter.
   * @public
   * @param {PresenterMessage} data The poll event received from the presenter.
   * @returns {void}
   * @usageNotes
   * This method is called when the component is initialized with the poll event received from the presenter.
   * It initializes the timer for the poll event if it has a timer.
   */
  initializeComponent(data : PresenterMessage) {
    this.questionEvent = data as PollPresenterSubscribeResponse;
    this.initializeTimer();
  }

  /**
   * Initializes the timer if one is provided in the `questionEvent`.
   * @private
   * @returns {void}
   * @usageNotes
   * This method sets a timer interval to decrement the `timer` property of `questionEvent` each second.
   * When the `timer` property reaches 0, the timer is cleared.
   */
  private initializeTimer() {
    if (this.questionEvent?.timer) {
      const timerInterval = setInterval(() => {
        if (this.questionEvent && this.questionEvent.timer) {
          this.questionEvent.timer -= 1;
          if (this.questionEvent.timer <= 0) {
            clearInterval(timerInterval);
          }
        }
      }, 1000);
    }
  }
}
