export interface BrainstormingPresenterStartVotingRequest {
  interaction: "brainstorming",
  ideas: string[],
  question: string,
  question_id: string,
  single_choice: boolean,
  voting_in_progress: boolean,
  timer?: number
}
