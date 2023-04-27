import {Injectable, NgZone} from '@angular/core';
import {GroupService} from "./group.service";
import {HttpClient} from "@angular/common/http";
import {environment} from '../environments/environment';
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
  private PRESENTER_TOPIC_SUFFIX: string = "_presenter_topic";
  private CLIENT_TOPIC_SUFFIX: string = "_client_topic";
  // A special request object holding a predefined string used to trigger the display of the current question to clients
  readonly questionTrigger: ClientQuestionRequest = {
    requestTrigger: "sfhdfknvkfdhglhfglr!)§%/273548"
  };
  currentPresenterMessage?: PresenterMessage;

  constructor(private groupService: GroupService, private zone: NgZone, private http: HttpClient) {
  }

  /**
   * Listens to the presenter channel for messages.
   * When a message is received, the provided callback function is invoked with the parsed message object.
   * @param {Function} handlePresenterMessage - The callback function that handles the presenter messages.
   */
  listenToPresenterChannel<Type>(handlePresenterMessage: (presenterMessage: Type) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${environment.apiUrl}/${this.groupService.getGroupName() + this.PRESENTER_TOPIC_SUFFIX}/sse`);
      eventSource.onopen = () => {
        resolve();
      };
      eventSource.onerror = (error) => {
        reject(error);
      };
      eventSource.onmessage = (eventWrapper) => {
        this.zone.run(
          () => {

            const rawEvent: EventResponse = JSON.parse(eventWrapper.data);
            if (!environment.production) {
              console.log("listenToPresenterChannel received this: " + JSON.stringify(rawEvent));
            }
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
    });
  }


  /**
   * Listens to the client channel for messages.
   * @param {Function} handleClientMessage - The callback function that handles the client messages.
   */
  listenToClientChannel<Type>(handleClientMessage: (clientMessage: Type) => void):Promise <void> {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${environment.apiUrl}/${this.groupService.getGroupName() + this.CLIENT_TOPIC_SUFFIX}/sse`);
      eventSource.onopen = () => {
        resolve();
      };
      eventSource.onerror = (error) => {
        reject(error);
      };
      eventSource.onmessage = (eventWrapper) => {
        this.zone.run(
          () => {
            const rawEvent: EventResponse = JSON.parse(eventWrapper.data);
            const event: Type = this.#decodeMessageFromBase64<Type>(rawEvent.message);
            // @ts-ignore
            event.id = rawEvent.id;
            // Run callback
            handleClientMessage(event);
          }
        )
      };
    });
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

    this.http.post<any>(`${environment.apiUrl}`, payload)
      .subscribe(result => {
        if (!environment.production) {
          console.log("Post request sent " + JSON.stringify(result));
        }
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

    this.http.post<any>(`${environment.apiUrl}`, payload)
      .subscribe(result => {
        if (!environment.production) {
          console.log("Post request sent" + JSON.stringify(result))
        }
      });
  }

  #encodeMessageToBase64(payload: any): string {
    // TODO Bind this properly to be {} at least
    return this.#utf8ToBase64(JSON.stringify(payload));
  }

  #decodeMessageFromBase64<Type>(payloadMessage: string): Type {
    return JSON.parse(this.#base64ToUtf8(payloadMessage));
  }

  #utf8ToBase64(str: string): string {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  }

  #base64ToUtf8(base64: string): string {
    return decodeURIComponent(Array.prototype.map.call(atob(base64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
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
