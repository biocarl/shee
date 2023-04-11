import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
/**
 * The ParticipantService is used to store and retrieve the name of the current participant.
 * @class
 * @Injectable
 */
export class ParticipantService {
  /**
   * The name of the current participant. Default value: "Unknown".
   * @private
   * @type {string}
   */
  private participantName: string = "Unknown";

  /**
   * Retrieves the name of the current participant.
   * @public
   * @returns {string} The name of the participant.
   */
  getParticipantName(): string {
    return this.participantName;
  }

  /**
   * Sets the name of the current participant.
   * @param {string} name The name to set for the participant.
   * @public
   * @returns {void}
   */
  setParticipantName(name: string) {
    this.participantName = name;
  }
}
