export interface DecisionClientPublishRequest {
  interaction: "decision",
  voting: number[],
  participantName: string,
  question_id: string
}
