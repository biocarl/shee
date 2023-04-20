export interface BrainstormingPresenterSubscribeResponse {
  interaction: "brainstorming",
  question_id: string,
  ideas: string[],
  question: string,
  timer?: number,
  voting_in_progress: boolean
}
