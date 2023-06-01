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


  listenToPresenterChannel<Type>(handlePresenterMessage: (presenterMessage: Type) => void, callingMethod?: string): Promise<void> {
    return this.listenToChannel<Type>(this.PRESENTER_TOPIC_SUFFIX, handlePresenterMessage, callingMethod);
  }

  listenToClientChannel<Type>(handleClientMessage: (clientMessage: Type) => void, callingMethod?: string): Promise<void> {
    return this.listenToChannel<Type>(this.CLIENT_TOPIC_SUFFIX, handleClientMessage, callingMethod);
  }

  private listenToChannel<Type>(topicSuffix: string, handleMessage: (message: Type) => void, callingMethod: string="Unknown"): Promise<void> {
    const method = callingMethod ;
    this.log.logToConsole(`${method} started listenToChannel method.`);
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${environment.apiUrl}/${this.groupService.getGroupName() + topicSuffix}/sse`);
      console.log(eventSource)
      eventSource.onopen = () => {
        this.log.logToConsole("Listener for channel initialized.")
        resolve();
      };
      eventSource.onerror = (error) => {
        this.log.logToConsole("Failed to initialize listener for channel.", error);
        reject(error);
      };
      eventSource.onmessage = (eventWrapper) => {
        this.zone.run(() => {
          const rawEvent: EventResponse = JSON.parse(eventWrapper.data);
          const event: Type = this.decodeMessageFromBase64<Type>(rawEvent.message);

          this.log.logToConsole("Received presenter message:", rawEvent);

          /* TODO: In our opinion, not needed anymore, but we are too scared to delete carls code :-D
            (questionid is now generated in query-to-event-service when publishing the presenter message)
                        // TODO Restrict generic to contain id field 'HasId' type: https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints
                        // @ts-ignore
                        if (!event.questionID) {
                          // @ts-ignore
                          event.questionID = rawEvent.id;
                        }
             */

          handleMessage(event);
        });
      };
    });
  }

  publishMessageToClientChannel<Type>(clientMessage: Type) {
    this.publishMessageToChannel<Type>(this.CLIENT_TOPIC_SUFFIX, clientMessage);
  }

  publishMessageToPresenterChannel<Type>(presenterMessage: Type) {
    this.publishMessageToChannel<Type>(this.PRESENTER_TOPIC_SUFFIX, presenterMessage);
  }

  private publishMessageToChannel<Type>(topicSuffix: string, message: Type) {
    const payload: EventCreationRequest = {
      topic: this.groupService.getGroupName() + topicSuffix,
      message: this.encodeMessageToBase64(message),
      title: "Event published",
      tags: [],
      attach: ""
    }

    this.log.logToConsole("Trying to send Post to channel:", payload);

    this.http.post<any>(`${environment.apiUrl}`, payload)
      .subscribe(result => {
          this.log.logToConsole("Post to channel earlier was successful.", result)
      });
  }

  requestLastMessage<Type>(handleCachedMessage: (presenterMessage: Type,timestamp:number) => void): void {
    const url = `${environment.apiUrl}/${this.groupService.getGroupName() + this.PRESENTER_TOPIC_SUFFIX}/json?poll=1&since=all`
    this.log.logToConsole(url);
    fetch(url)
      .then(response => response.text())
      .then(text => {
        // If the response is empty, log a message and return early
        if (!text.trim()) {
          this.log.logToConsole('No cached messages returned from server');
          return;
        }

        // Split the text by newlines to separate each JSON object
        let jsonStrings = text.trim().split('\n');

        // Get the last JSON object (the newest message)
        let lastJsonString = jsonStrings[jsonStrings.length - 1];

        // Parse the last JSON object
        let newestMessage = JSON.parse(lastJsonString);

        this.log.logToConsole('Newest Message:', newestMessage);
        const event: Type = this.decodeMessageFromBase64<Type>(newestMessage.message);
        handleCachedMessage(event,newestMessage.time);
      })
      .catch((error) => {
        this.log.logToConsole('Error retrieving cached Messages:', error);
      });
  }

  private encodeMessageToBase64(payload: any): string {
    // TODO Bind this properly to be {} at least
    return this.utf8ToBase64(JSON.stringify(payload));
  }

  private decodeMessageFromBase64<Type>(payloadMessage: string): Type {
    return JSON.parse(this.base64ToUtf8(payloadMessage));
  }

  private utf8ToBase64(str: string): string {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  }

  private base64ToUtf8(base64: string): string {
    return decodeURIComponent(Array.prototype.map.call(atob(base64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  }
}

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
