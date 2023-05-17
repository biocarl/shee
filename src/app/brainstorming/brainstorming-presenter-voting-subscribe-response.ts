export interface BrainstormingPresenterVotingSubscribeResponse {
  questionID: string;
  singleChoice: boolean;
  votingInProgress: boolean;
  interaction: "brainstorming",
  ideas: string[],
  question: string;
  timer: number;
}
