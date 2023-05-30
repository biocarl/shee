import {Component, OnInit} from '@angular/core';
import {PresenterView} from "../../presenter-view";
import {PollPresenterSubscribeResponse} from "../poll-presenter-subscribe-response";
import {QueueService} from "../../queue.service";
import {PollClientSubscribeResponse} from "../poll-client-subscribe-response";
import {PresenterMessage} from "../../presenter-message";
import {LoggerService} from "../../logger.service";
import {addCookie, getCookieValueFor} from "../../cookie-utlis";

@Component({
  selector: 'app-poll-presenter',
  templateUrl: './poll-presenter.component.html',
  styleUrls: ['./poll-presenter.component.css']
})
/**
 * The PollPresenterComponent displays the main question to answer,
 * along with the different polling outcomes based on a defined set of options and the votes provided by the clients.
 * @component
 */
export class PollPresenterComponent implements PresenterView, OnInit {
  questionEvent ?: PollPresenterSubscribeResponse;

  accumulatedClientChoices ?: Array<{ count: number, users: Array<string> }>;
  userHistory: Set<string> = new Set();

  constructor(private queueService: QueueService, private log: LoggerService) {
  }

  ngOnInit(): void {
    this.subscribeToClientChannel();
    this.initUsersFromCookies(this.userHistory);
  }

  initializeComponent(data: PresenterMessage): void {
    this.questionEvent = data as PollPresenterSubscribeResponse;
    this.accumulatedClientChoices = Array(this.questionEvent.answers.length).fill({count: 0, users: []});
    this.initializeTimer();
  }

  private subscribeToClientChannel() {
    this.queueService.listenToClientChannel<PollClientSubscribeResponse>(pollSubscriptionEvent => {
      this.handlePollSubscriptionEvent(pollSubscriptionEvent);
    });
  }

  private handlePollSubscriptionEvent(pollSubscriptionEvent: PollClientSubscribeResponse): void {
    if (!this.questionEvent) {
      console.error("Error: question event was not populated by parent client component");
      return;
    }

    if (this.canUpdatePollChoices(pollSubscriptionEvent)) {
      this.updateClientChoices(pollSubscriptionEvent);
    }

    if (pollSubscriptionEvent.participantName) {
      this.logParticipantVote(pollSubscriptionEvent);
      this.addUserToUserHistory(pollSubscriptionEvent.participantName);
    }
  }

// TODO: better name & ask Carl about !!
  private canUpdatePollChoices(pollSubscriptionEvent: PollClientSubscribeResponse): boolean {
    return !!(
      this.accumulatedClientChoices &&
      pollSubscriptionEvent.questionID === this.questionEvent?.questionID &&
      this.isInValidTimeRangeIfSet()
    );
  }

  private updateClientChoices(pollSubscriptionEvent: PollClientSubscribeResponse): void {
    this.accumulatedClientChoices = this.accumulatedClientChoices?.map((totalChoiceResult, index) => {
      const obj = structuredClone(totalChoiceResult); // You work with references here and need a deepClone on top
      if (pollSubscriptionEvent.voting[index] !== 0) {
        obj.count += pollSubscriptionEvent.voting[index];
        obj.users.push(pollSubscriptionEvent.participantName);
      }
      return obj;
    });
  }

  private logParticipantVote(pollSubscriptionEvent: PollClientSubscribeResponse): void {
    const votedAnswer = this.questionEvent?.answers[pollSubscriptionEvent.voting.indexOf(1)];
    this.log.toConsole(pollSubscriptionEvent.participantName + ' has voted for ' + votedAnswer);
  }

  getPercentage(index: number): number {
    if (!this.accumulatedClientChoices) {
      return 0;
    }

    const totalVotes = this.accumulatedClientChoices.reduce((acc, curr) => acc + curr.count, 0);
    if (totalVotes === 0) {
      return 0;
    }

    return (this.accumulatedClientChoices[index].count / totalVotes) * 100;
  }

  private isInValidTimeRangeIfSet() {
    if (this.questionEvent?.timer !== undefined) {
      return this.questionEvent.timer > 0;
    }
    return true;
  }

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

  getMissingUsers(currentUsers: Array<string>) {
    return Array.from(this.userHistory).filter((x => !currentUsers.includes(x)));
  }

  clearUserHistory() {
    this.userHistory.clear();
  }

  initUsersFromCookies(users: Set<string>) {
    const userCookies = getCookieValueFor("users");
    if (userCookies) {
      userCookies.split("|").forEach((user: string) => users.add(user));
    }
  }

  addUserToUserHistory(user: string) {
    this.userHistory.add(user);
    addCookie("users", Array.from(this.userHistory).join("|"));
  }
}
