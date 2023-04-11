import {Injectable, NgZone} from '@angular/core';
import {GroupService} from "./group.service";
import {HttpClient} from "@angular/common/http";
import {ClientQuestionRequest} from "./client-question-request";
import {PresenterMessage} from "./presenter-message";

@Injectable({
  providedIn: 'root'
})
/**
 * The QueueService is used to listen to and publish messages to event channels via Ntfy.sh.
 * @class
 * @Injectable
 */
export class QueueService {
  /**
   * Suffix to append to the group name to form the presenter topic
   * @type {string}
   * @private
   */
  private PRESENTER_TOPIC_SUFFIX: string = "_presenter_topic";
  /**
   * Suffix to append to the group name to form the client topic
   * @type {string}
   * @private
   */
  private CLIENT_TOPIC_SUFFIX: string = "_client_topic";
  /**
   * A special request object holding a predefined string used to trigger the display of the current question to clients
   * @type {ClientQuestionRequest}
   * @readonly
   */
  readonly questionTrigger: ClientQuestionRequest = {
    requestTrigger: "sfhdfknvkfdhglhfglr!)§%/273548"
  };
  /**
   * The current presenter message.
   * @type {PresenterMessage | undefined}
   */
  currentPresenterMessage?: PresenterMessage;

  /**
   * Creates a new instance of the `QueueService`.
   *
   * @constructor
   * @param groupService The `GroupService` for retrieving the current group name
   * @param zone The `NgZone` for running Angular change detection
   * @param http The `HttpClient` for sending HTTP requests to the ntfy.sh API
   */
  constructor(private groupService: GroupService, private zone: NgZone, private http: HttpClient) {
  }

  /**
   * Listens to the presenter channel for messages.
   * When a message is received, the provided callback function is invoked with the parsed message object.
   * @param {Function} handlePresenterMessage - The callback function that handles the presenter messages.
   */
  listenToPresenterChannel<Type>(handlePresenterMessage: (presenterMessage: Type) => void) {
    const eventSource = new EventSource(`https://ntfy.sh/${this.groupService.getGroupName() + this.PRESENTER_TOPIC_SUFFIX}/sse`);
    eventSource.onmessage = (eventWrapper) => {
      this.zone.run(
        () => {

          const rawEvent: EventResponse = JSON.parse(eventWrapper.data);
          console.log("listenToPresenterChannel received this: " + JSON.stringify(rawEvent));
          const event: Type = this.#decodeMessageFromBase64<Type>(rawEvent.message);

          // TODO Restrict generic to contain id field 'HasId' type: https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints
          // @ts-ignore
          if (!event.question_id) {
            // @ts-ignore
            event.question_id = rawEvent.id;
          }
          // Run callback
          handlePresenterMessage(event);
        }
      )
    };
  }

  /**
   * Listens to the client channel for messages.
   * @param {Function} handleClientMessage - The callback function that handles the client messages.
   */
  listenToClientChannel<Type>(handleClientMessage: (clientMessage: Type) => void) {
    const eventSource = new EventSource(`https://ntfy.sh/${this.groupService.getGroupName() + this.CLIENT_TOPIC_SUFFIX}/sse`);
    eventSource.onmessage = (eventWrapper) => {
      this.zone.run(
        () => {
          const rawEvent: EventResponse = JSON.parse(eventWrapper.data);
          const event: Type = this.#decodeMessageFromBase64<Type>(rawEvent.message);
          // Run callback
          handleClientMessage(event);
        }
      )
    };
  }

  /**
   * Publishes a message to the client channel.
   * @param {any} clientMessage - The message to be published to the client channel.
   */
  publishMessageToClientChannel<Type>(clientMessage: Type) {
    const payload: EventCreationRequest = {
      topic: this.groupService.getGroupName() + this.CLIENT_TOPIC_SUFFIX,
      message: this.#encodeMessageToBase64(clientMessage),
      title: "Client event published",
      tags: [],
      attach: ""
    }

    this.http.post<any>('https://ntfy.sh', payload)
      .subscribe(result => {
        console.log("Post request sent " + JSON.stringify(result));
      });
  }

  /**
   * Publishes a message to the presenter channel.
   *
   * @template Type - The type of the message to be published.
   * @param {any} presenterMessage - The message to be published to the presenter channel.
   * @returns {void}
   */
  publishMessageToPresenterChannel<Type>(presenterMessage: Type) {
    const payload: EventCreationRequest = {
      topic: this.groupService.getGroupName() + this.PRESENTER_TOPIC_SUFFIX,
      message: this.#encodeMessageToBase64(presenterMessage),
      title: "Presenter event published",
      tags: [],
      attach: ""
    }

    this.http.post<any>('https://ntfy.sh', payload)
      .subscribe(result => {
        console.log("Post request sent" + JSON.stringify(result))
      });
  }

  /**
   * Encodes a message to Base64.
   *
   * @param payload - The message to be encoded.
   * @returns The encoded message.
   */
  #encodeMessageToBase64(payload: any): string {
    // TODO Bind this properly to be {} at least
    return btoa(JSON.stringify(payload));
  }

  /**
   * Decodes a Base64 message.
   *
   * @param payloadMessage- The message to be decoded.
   * @returns The decoded message.
   */
  #decodeMessageFromBase64<Type>(payloadMessage: string): Type {
    return JSON.parse(atob(payloadMessage));
  }
}

/**
 * Interface for the response received when making a POST request to the backend.
 * id is auto-generated by ntfy.
 * @interface
 */
interface EventResponse {
  id: string,
  topic: string,
  title: string,
  message: string,
  tags: string[],
  attachment: {
    "name": string,
    "url": string
  }
}

/**
 * Interface for the payload to be sent when making a POST request to the backend.
 * @interface
 */
interface EventCreationRequest {
  topic: string,
  message: string,
  title: string,
  tags: string[],
  attach: string,
}
