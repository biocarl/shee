export interface DecisionPresenterSubscribeResponse {
  question_id: string,
  interaction: "decision",
  answers: string[],
  timer?: number
}
