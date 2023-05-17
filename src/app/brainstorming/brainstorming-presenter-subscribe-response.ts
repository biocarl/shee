export interface BrainstormingPresenterSubscribeResponse {
  interaction: "brainstorming",
  questionID: string,
  question: string,
  timer?: number,
  votingInProgress: boolean,
  openForIdeas: boolean,
  ideas: string[]
}
