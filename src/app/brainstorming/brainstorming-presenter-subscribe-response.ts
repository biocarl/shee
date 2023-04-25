export interface BrainstormingPresenterSubscribeResponse {
  interaction: "brainstorming",
  question_id: string,
  question: string,
  timer?: number,
  voting_in_progress: boolean,
  openForIdeas: boolean
}
