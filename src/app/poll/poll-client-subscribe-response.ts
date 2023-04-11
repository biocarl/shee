/**
 * The interface for the poll client subscription response.
 * This interface defines the structure of the response received from a client for the "poll" interaction.
 * @interface
 */
export interface PollClientSubscribeResponse {
  /**
   * The name of the participant who submitted the response.
   * @type {string}
   */
  participantName: string;
  /**
   * An array of integers representing the votes for each answer choice.
   * Each entry in the array corresponds to an answer choice.
   * @type {number[]}
   */
  voting: number[];
  /**
   * The ID of the question that the response is for.
   * @type {string}
   */
  question_id: string;
}
