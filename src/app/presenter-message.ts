// Is the most general type (all other presenter events subscribe from this) - TODO: Introduce inheritance
export interface PresenterMessage {
  interaction: string;
  question_id: string;
}
