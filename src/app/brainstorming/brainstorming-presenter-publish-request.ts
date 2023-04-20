export interface BrainstormingPresenterPublishRequest {
  interaction: "brainstorming",
  question: string,
  question_id: string,
  timer?: number,
  client_only?: boolean,
  openForIdeas: boolean
}
