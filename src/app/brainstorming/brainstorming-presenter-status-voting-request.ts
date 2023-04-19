export interface BrainstormingPresenterStatusVotingRequest {
  interaction: "brainstorming",
  ideas: string[],
  question: string,
  question_id: string,
  single_choice: boolean,
  voting_in_progress: boolean,
  timer?: number,
  client_only?: boolean
}
