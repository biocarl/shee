import {Component} from '@angular/core';
import {ClientView} from "../../client-view";
import {QueueService} from "../../queue.service";
import {PresenterMessage} from "../../presenter-message";
import {ParticipantService} from "../../participant.service";

/**
 * The interface for the counter presenter subscribe response.
 * This interface defines the structure of the response received from the presenter for the "pair" interaction.
 * @interface
 */
interface CounterPresenterSubscribeResponse {
}

/**
 * The interface for the counter client publish request.
 * This interface defines the structure of the client message sent to the presenter for the "pair" interaction.
 * @interface
 */
interface CounterClientPublishRequest {
  /**
   * The type of interaction, in this case set to "pair".
   * @type {string}
   */
  interaction: string,
  /**
   * The name of the participant obtained from the ParticipantService.
   * @type {string}
   */
  participantName: string
  // Here you could for example send an external IP to ensure (on presenter side)
  // that no one is sending a request twice
}

@Component({
  selector: 'app-counter-client',
  templateUrl: './pair-client.component.html',
  styleUrls: ['./pair-client.component.css']
})
/**
 * The pair client component is used to display the pair interaction view and interact with the presenter.
 * @component
 * @implements ClientView
 */
export class PairClientComponent implements ClientView {
  /**
   * The counter request received from the presenter.
   * @type {CounterPresenterSubscribeResponse | undefined}
   * @private
   */
  private counterRequestFromPresenter ? : CounterPresenterSubscribeResponse;

  /**
   * Creates a new instance of the PairClientComponent.
   * @constructor
   * @param {QueueService} queueService The service for interacting with the presentation queue.
   * @param {ParticipantService} participantService The service for managing the participant name.
   */
  constructor(private queueService : QueueService, private participantService: ParticipantService) {}
  /**
   * Initializes the component by setting the counter request from the presenter,
   * and publishing a client message containing the participant's name.
   * @param {PresenterMessage} data The presenter message containing the counter request.
   * @public
   * @returns {void}
   * @implements {ClientView.initializeComponent}
   */
  initializeComponent(data: PresenterMessage): void {
    this.counterRequestFromPresenter = data as CounterPresenterSubscribeResponse;

    const message : CounterClientPublishRequest =  {
      interaction: "pair",
      participantName: this.participantService.getParticipantName()
    };
    this.queueService.publishMessageToClientChannel<CounterClientPublishRequest>(message);
  }
}
