/**
 The interface for the client message sent to the presenter for the "poll" interaction.
 @interface
 */
export interface PollClientPublishRequest {
interaction: "poll",
/**
Each element in the array denotes an answer choice, for the selected choice the element is set to 1, otherwise 0.
The length of the array must match the number of answer choices.
*/
voting : number[],
/**
The name of the participant who submitted the vote.
*/
participantName? : string,
/**
The ID of the poll question being answered.
*/
question_id: string
}
