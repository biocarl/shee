export interface BrainstormingPresenterStatusVotingRequest {
  interaction: "brainstorming",
  ideas?: string[],
  question: string,
  questionID: string,
  singleChoice: boolean,
  votingInProgress: boolean,
  timer?: number,
  clientOnly?: boolean
}
