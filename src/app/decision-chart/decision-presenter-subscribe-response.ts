export interface DecisionPresenterSubscribeResponse {
  questionID: string,
  interaction: "decision",
  answers: string[],
  timer?: number
}
