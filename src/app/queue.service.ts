import { Injectable, NgZone } from '@angular/core';
import { GroupService } from './group.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { PresenterMessage } from './presenter-message';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
/**
 * The QueueService is used to listen to and publish messages to event channels via Ntfy.sh.
 * @class
 * @Injectable
 */
export class QueueService {
  private PRESENTER_TOPIC_SUFFIX: string = '_presenter_topic';
  private CLIENT_TOPIC_SUFFIX: string = '_client_topic';
  currentPresenterMessage?: PresenterMessage;

  constructor(
    private groupService: GroupService,
    private zone: NgZone,
    private http: HttpClient,
    private log: LoggerService
  ) {}



  /**
   * Params queue service
   * @template Type
   * @param handlePresenterMessage
   * @param [callingMethod]
   * @returns to presenter channel
   */
  listenToPresenterChannel<Type>(
    handlePresenterMessage: (presenterMessage: Type) => void,
    callingMethod: string = 'Unknown'
  ): Promise<void> {
    return this.listenToChannel<Type>(
      handlePresenterMessage,
      this.PRESENTER_TOPIC_SUFFIX,
      callingMethod
    );
  }

  /**
   * Listens to the client channel for messages.
   * @param {Function} handleClientMessage - The callback function that handles the client messages.
   * @param {string} [callingMethod] - The name of the Method that called this method.
   */
  listenToClientChannel<Type>(
    handleClientMessage: (clientMessage: Type) => void,
    callingMethod: string = 'Unknown'
  ): Promise<void> {
    this.log.logToConsole("Listener for presenter channel initialized.")
    return this.listenToChannel<Type>(
      handleClientMessage,
      this.CLIENT_TOPIC_SUFFIX,
      callingMethod
    );
  }

  private listenToChannel<Type>(
    handleMessage: (message: Type) => void,
    topicSuffix: string,
    callingMethod: string
  ): Promise<void> {
    this.log.logToConsole(
      `${callingMethod} started listenToChannel method for ${topicSuffix}.`
    );
    const SSE_ROUTE = '/sse';
    const eventSourceUrl = this.getEventSourceUrl(topicSuffix, SSE_ROUTE);
    const eventSource = new EventSource(eventSourceUrl);

    return new Promise((resolve, reject) => {
      eventSource.onopen = () => resolve();
      eventSource.onerror = (error) => reject(error);
      eventSource.onmessage = (eventWrapper) => {
        const eventMessage: Type = this.unwrapEventMessage(eventWrapper);
        handleMessage(eventMessage);
      };
    });
  }

  private unwrapEventMessage<Type>(eventWrapper: any): Type {
    let event: Type|any ;
    this.zone.run(() => {
      const rawEvent: EventResponse = JSON.parse(eventWrapper.data);
      event = this.decodeMessageFromBase64<Type>(rawEvent.message);
       // TODO Restrict generic to contain id field 'HasId' type: https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints
            // @ts-ignore
            if (!event.questionID) {
              // @ts-ignore
              event.questionID = rawEvent.id;
            }
    });
    return event;
  }

  private getEventSourceUrl(topicSuffix: string, route: string): string {
    const groupName = this.groupService.getGroupName();
    return `${environment.apiUrl}/${groupName}${topicSuffix}${route}`;
  }

  publishMessageToClientChannel<Type>(clientMessage: Type) {
    this.publishMessageToChannel<Type>(
      clientMessage,
      this.CLIENT_TOPIC_SUFFIX
    );
  }

  publishMessageToPresenterChannel<Type>(presenterMessage: Type) {
    this.publishMessageToChannel<Type>(
      presenterMessage,
      this.PRESENTER_TOPIC_SUFFIX
    );
  }

  private publishMessageToChannel<Type>(message: Type, topicSuffix: string) {
    const payload: EventCreationRequest = {
      topic: this.groupService.getGroupName() + topicSuffix,
      message: this.encodeMessageToBase64(message),
      title: `${topicSuffix} event published`,
      tags: [],
      attach: '',
    };

    this.http.post<any>(`${environment.apiUrl}`, payload).subscribe();
  }

  requestLastMessage<Type>(
    handleCachedMessage: (presenterMessage: Type, timestamp: number) => void
  ): void {
    const CACHED_MESSAGES_ROUTE = '/json?poll=1&since=all';
    const url = this.getEventSourceUrl(
      this.PRESENTER_TOPIC_SUFFIX,
      CACHED_MESSAGES_ROUTE
    );
    fetch(url)
      .then((response) => response.text())
      .then((text) => {
        if (!text.trim()) {
          this.log.logToConsole('No cached messages returned from server');
          return;
        }

        let jsonStrings = text.trim().split('\n');
        let lastJsonString = jsonStrings[jsonStrings.length - 1];
        let newestMessage = JSON.parse(lastJsonString);

        this.log.logToConsole('Newest Message:', newestMessage);
        const event: Type = this.decodeMessageFromBase64<Type>(
          newestMessage.message
        );
        handleCachedMessage(event, newestMessage.time);
      })
      .catch((error) => {
        this.log.logToConsole('Error retrieving cached Messages:', error);
      });
  }

  private encodeMessageToBase64(payload: any): string {
    return btoa(
      encodeURIComponent(JSON.stringify(payload)).replace(
        /%([0-9A-F]{2})/g,
        (_, p1) => String.fromCharCode(parseInt(p1, 16))
      )
    );
  }

  private decodeMessageFromBase64<Type>(payloadMessage: string): Type {
    return JSON.parse(
      decodeURIComponent(
        Array.prototype.map
          .call(
            atob(payloadMessage),
            (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join('')
      )
    );
  }
}

/**
 * Publishes a message to the client channel.
 * @param {any} clientMessage - The message to be published to the client channel.
 */

/**
 * Publishes a message to the presenter channel.
 *
 * @template Type - The type of the message to be published.
 * @param {any} presenterMessage - The message to be published to the presenter channel.
 * @returns {void}
 */

/**
 * Interface for the response received when making a POST request to the backend.
 * id is auto-generated by ntfy.
 * @interface
 */
interface EventResponse {
  id: string;
  topic: string;
  title: string;
  message: string;
  tags: string[];
  attachment: {
    name: string;
    url: string;
  };
}

/**
 * Interface for the payload to be sent when making a POST request to the backend.
 * @interface
 */
interface EventCreationRequest {
  topic: string;
  message: string;
  title: string;
  tags: string[];
  attach: string;
}
