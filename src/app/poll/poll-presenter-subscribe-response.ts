/**
 * The interface for the poll presenter subscribe response.
 * This interface defines the structure of the response sent from the presenter for the "poll" interaction.
 * @interface
 */
export interface PollPresenterSubscribeResponse {
  /**
   * The unique ID of the poll question.
   * @type {string}
   */
  question_id: string,
  /**
   * The type of interaction, in this case set to "poll".
   * @type {string}
   */
  interaction: "poll",
  /**
   * The duration of the poll in seconds. Optional.
   * @type {number | undefined}
   */
  timer?: number,
  /**
   * An array of answer choices for the poll question.
   * @type {string[]}
   */
  answers: string[],
  /**
   * The text of the poll question.
   * @type {string}
   */
  question: string;
}
