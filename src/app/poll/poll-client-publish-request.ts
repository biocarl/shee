/**
 The interface for the client message sent to the presenter for the "poll" interaction.
 @interface
 */
export interface PollClientPublishRequest {
/**
The type of interaction, in this case set to "poll".
@type {string}
*/
interaction: "poll",
/**
The array of votes for each answer choice in the poll.
The length of the array must match the number of answer choices.
@type {number[]}
*/
voting : number[],
/**
The name of the participant who submitted the vote.
@type {string}
*/
participantName : string,
  /**
The ID of the poll question being answered.
@type {string}
*/
question_id: string
}
