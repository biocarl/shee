export interface BrainstormingPresenterVotingSubscribeResponse {
  question_id: string;
  single_choice: boolean;
  interaction: "brainstorming",
  ideas: string[],
  question: string;
}
