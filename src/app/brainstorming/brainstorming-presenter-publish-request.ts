export interface BrainstormingPresenterPublishRequest {
  interaction: "brainstorming",
  question: string,
  questionID: string,
  timer?: number,
  clientOnly?: boolean,
  openForIdeas: boolean
}
