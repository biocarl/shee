export interface DecisionClientPublishRequest {
  interaction: "decision",
  voting: number[],
  participantName: string,
  questionID: string
}
