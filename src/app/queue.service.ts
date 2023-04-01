import {Injectable, NgZone} from '@angular/core';
import {GroupService} from "./group.service";
import {HttpClient} from "@angular/common/http";

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

interface ClientPublish {
  topic: string,
  message: string,
  title: string,
  tags: string[],
  attach: string,
}


@Injectable({
  providedIn: 'root'
})
export class QueueService {
  private PRESENTER_TOPIC_SUFFIX: string = "_presenter_topic";
  private CLIENT_TOPIC_SUFFIX: string = "_client_topic";

  constructor(private groupService : GroupService, private zone : NgZone, private http: HttpClient) { }

  onPresenterEvent<Type>(handlePresenterEvent: (event : Type) => void) {
    const eventSource = new EventSource(`https://ntfy.sh/${this.groupService.getGroupName() + this.PRESENTER_TOPIC_SUFFIX}/sse`);
    eventSource.onmessage = (eventWrapper) => {
      this.zone.run(
        () => {

          const rawEvent : PresenterSubscribe = JSON.parse(eventWrapper.data);
          const event : Type = this.decodeMessageFromBase64<Type>(rawEvent.message);

          // TODO Restrict generic to contain id field 'HasId' type: https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints
          // @ts-ignore
          event.id = rawEvent.id;


          // Run callback
          handlePresenterEvent(event);
        }
      )
    };
  }


  publishClientEvent<Type>(publishEvent: Type) {
    const payload : ClientPublish = {
      topic: this.groupService.getGroupName() + this.CLIENT_TOPIC_SUFFIX,
      message: this.encodeMessageToBase64(publishEvent),
      title: "Client event published",
      tags: [],
      attach: ""
    }

    this.http.post<any>('https://ntfy.sh', payload)
      .subscribe(result => {
        console.log("Post request sent" + result)
      });

  }

  // TODO Bind this properly to be {} at least
  encodeMessageToBase64(payload : any) : string{
    return btoa(JSON.stringify(payload));
  }

  decodeMessageFromBase64<Type>( payloadMessage : string) : Type{
    return JSON.parse(atob(payloadMessage));
  }

}
