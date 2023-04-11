// Is the most general type (all other presenter events subscribe from this) - TODO: Introduce inheritance
/**
 * Represents a presenter message.
 * @interface
 */
export interface PresenterMessage {
  /**
   * The type of interaction being created.
   * @type {string}
   */
  interaction: string;
  question_id: string;
}
