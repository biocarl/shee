import {Component, OnInit} from '@angular/core';
import {PresenterView} from "../../presenter-view";
import {PollPresenterSubscribeResponse} from "../poll-presenter-subscribe-response";
import {QueueService} from "../../queue.service";
import {PollClientSubscribeResponse} from "../poll-client-subscribe-response";
import {PresenterMessage} from "../../presenter-message";

@Component({
  selector: 'app-poll-presenter',
  templateUrl: './poll-presenter.component.html',
  styleUrls: ['./poll-presenter.component.css']
})
/**
 * The PollPresenterComponent manages the "poll" interaction from the presenter side.
 * It listens to events from clients and manages the state of the interaction.
 * @component
 */
export class PollPresenterComponent implements PresenterView, OnInit {
  /**
   * The current question event that has been received from the presenter.
   * @type {PollPresenterSubscribeResponse | undefined}
   * @public
   */
  questionEvent ?: PollPresenterSubscribeResponse;
  /**
   * The array of responses to the current question.
   * Each entry in the array corresponds to an answer choice.
   * @type {number[] | undefined}
   * @public
   */
  questionResponses ?: number[];

  /**
   * Initializes a new instance of the PollPresenterComponent.
   * @constructor
   * @param {QueueService} queueService The service for interacting with the presentation queue.
   */
  constructor(private queueService: QueueService) {
  }

  /**
   * Listens for client messages and processes them.
   * @private
   * @returns {void}
   * @implements {OnInit}
   */
  ngOnInit(): void {
    this.queueService.listenToClientChannel<PollClientSubscribeResponse>(pollSubscriptionEvent => {
      if (!this.questionEvent) {
        console.error("Error: question event was not populated by parent client component");
        return;
      }

      if (this.questionResponses && pollSubscriptionEvent.question_id === this.questionEvent.id
          && this.isInValidTimeRangeIfSet()) {
        this.questionResponses = this.questionResponses.map((total, index) => total + pollSubscriptionEvent.voting[index]);
      }

      if (pollSubscriptionEvent.participantName) {
        console.log(pollSubscriptionEvent.participantName + ' has voted for ' + this.questionEvent.answers[pollSubscriptionEvent.voting.indexOf(1)]);
      }
    });
  }

  /**
   * Determines if the current time is within the valid time range for answering the question, if a timer is set.
   * @private
   * @returns {boolean} Whether the current time is within the valid time range for answering the question.
   * @usageNotes
   * This method checks if the `timer` property of `questionEvent` is set, and if so, returns `true` if the remaining
   * time is greater than 0. Otherwise, it returns `true` to allow answers when no timer is given.
   */
  private isInValidTimeRangeIfSet() {
    if(this.questionEvent?.timer){
      return this.questionEvent.timer > 0;
    }
    return true;
  }

  /**
   * Initializes the component with data from the presenter message and starts the timer if one is set.
   * @param {PresenterMessage} data The presenter message containing the poll event.
   * @public
   * @returns {void}
   * @implements {PresenterView.initializeComponent}
   */
  initializeComponent(data: PresenterMessage): void {
    this.questionEvent = data as PollPresenterSubscribeResponse;
    this.questionResponses = Array(this.questionEvent.answers.length).fill(0);
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
