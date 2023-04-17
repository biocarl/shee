export interface BrainstormingPresenterVotingSubscribeResponse {
  question_id: string;
  single_choice: boolean;
  voting_in_progress: boolean;
  interaction: "brainstorming",
  ideas: string[],
  question: string;
}
