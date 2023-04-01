import {Injectable, NgZone} from '@angular/core';
import {GroupService} from "./group.service";

interface PresenterSubscribe {
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


@Injectable({
  providedIn: 'root'
})
export class QueueService {
  private PRESENTER_TOPIC_SUFFIX: string = "_presenter_topic";

  constructor(private groupService : GroupService, private zone : NgZone) { }

  onPresenterEvent<Type>(handlePresenterEvent: (event : Type) => void) {
    const eventSource = new EventSource(`https://ntfy.sh/${this.groupService.groupName + this.PRESENTER_TOPIC_SUFFIX}/sse`);
    eventSource.onmessage = (eventWrapper) => {
      this.zone.run(
        () => {

          const rawEvent : PresenterSubscribe = this.decodeMessageFromBase64(JSON.parse(eventWrapper.data));
          const event : Type = rawEvent.message as Type;

          // TODO Restrict generic to contain id field 'HasId' type
          // @ts-ignore
          event.id = rawEvent.id;


          // Run callback
          handlePresenterEvent(event);
        }
      )
    };
  }

  decodeMessageFromBase64( payload : PresenterSubscribe) : PresenterSubscribe {
    if (typeof payload.message === "string") {
      payload.message = JSON.parse(atob(payload.message));
    }
    return payload;
  }
}
