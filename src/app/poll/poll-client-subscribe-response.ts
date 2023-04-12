/**
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
   * Each element in the array denotes an answer choice, for the selected choice the element is set to 1, otherwise 0.
   * The length of the array must match the number of answer choices.
  */
  voting: number[];
  /**
   * The ID of the question that the response is for.
   * @type {string}
   */
  question_id: string; // TODO refactor to questionId
}
