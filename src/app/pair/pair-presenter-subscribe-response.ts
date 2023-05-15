/**
 * This interface defines the structure of the response sent from the presenter for the "pair" interaction.
 * @interface
 */
export interface PairPresenterSubscribeResponse {
  // later we will e.g. send security relevant information like a public key in the payload,
  // and potentially we need to introduce two separate dtos for presenter and client side
  interaction: "poll",
  anonymity: "anonymous"| "public";
  question_id: string; // TODO Refactor to questionID
  client_only?: boolean;
}
