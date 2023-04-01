import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";
import {GroupService} from "../group.service";
import {QueueService} from "../queue.service";

interface ClientPublish {
  topic: string,
  message: string | PollPublish, // base64 encoding
  title: string,
  tags: string[],
  attach: string,
}

interface PollPublish {
  event: string, voting : number[],
  participant : string,
  question_id: string
};

interface PollSubscribe {
  id: string,
  "event": "question_event",
  "questions" : string[]
}

interface PresenterSubscribe {
  id: string,
  topic: string,
  title: string,
  message: string | PollSubscribe,
  tags: string[],
  attachment: {
    "name": string,
    "url": string
  }
}

@Component({
  selector: 'app-vote-selector',
  templateUrl: './vote-selector.component.html',
  styleUrls: ['./vote-selector.component.css']
})
export class VoteSelectorComponent implements OnInit{

  groupName: string | null = "";
  questionId : string = "";
  questions ? : string[];

  colorPalette : string [] = [ "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44"];
  voted: boolean = false;

  constructor(private http: HttpClient, private zone : NgZone, private route: ActivatedRoute, private groupService : GroupService, private queueService : QueueService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe( params => {
      this.groupName = params.get("group");
      if(this.groupName){
        this.groupService.groupName = this.groupName;
      }
      console.log(this.groupName);
    });

    //this.queueService.onPresenterEvent<PollSubscribe>(event => console.log(event));


    const eventSource = new EventSource(`https://ntfy.sh/${this.groupName + "_presenter_topic"}/sse`);
    eventSource.onmessage = (eventWrapper) => {
      this.zone.run(
        () => {

          // this is happening in service
          const rawEvent : PresenterSubscribe = this.decodeMessageFromBase64(JSON.parse(eventWrapper.data));
          const pollSubscriptionEvent : PollSubscribe = rawEvent.message as PollSubscribe;
          pollSubscriptionEvent.id = rawEvent.id;


          // this is happening client side
          this.questionId = pollSubscriptionEvent.id;
          this.questions =  pollSubscriptionEvent.questions;
          this.groupService.hasQuestions = true;
          this.voted = false; //allow voting again
        }
      )
    };

    return;
  }

  encodeMessageToBase64(payload : ClientPublish) : ClientPublish {
    payload.message = btoa(JSON.stringify(payload.message));
    return payload;
  }

  decodeMessageFromBase64( payload : PresenterSubscribe) : PresenterSubscribe {
    if (typeof payload.message === "string") {
      payload.message = JSON.parse(atob(payload.message));
    }
    return payload;
  }

  voteForQuestion(voteSelectionIndex: number) {
    if(!this.questions) return

    // Wait for the others
    this.voted = true;
    this.groupService.hasQuestions = false;

    // handle vote
    const voting : number[] = Array(this.questions.length).fill(0);
    voting[voteSelectionIndex] = 1;
    const message : PollPublish =  {
        event: "poll_event",
        question_id: this.questionId,
        voting : voting,
        participant : "biocarl" // TODO This you will retrieve from the frontend
      };

    const payload : ClientPublish = {
      topic: this.groupName + "_client_topic", // TODO Will eventually extracted from route root/:groupname
      message: message,
      title: "Publish polling results",
      tags: [],
      attach: ""
    }

    this.http.post<any>('https://ntfy.sh', this.encodeMessageToBase64(payload))
      .subscribe(result => {
        console.log("Post request sent" + result)
      });
  }
}
