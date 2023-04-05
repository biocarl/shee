export interface DecisionClientPublishRequest {
  interaction: "decision",
  voting : number[],
  participant : string,
  question_id: string
}
