export interface BrainstormingPresenterSubscribeResponse {
  interaction: "brainstorming",
  question_id: string,
  idea_id: string,
  ideas: string[],
  question: string;
}
