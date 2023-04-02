import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {AnchorDirective} from "../presenter/anchor.directive";
import {ActivatedRoute} from "@angular/router";
import {QueueService} from "../queue.service";
import {GroupService} from "../group.service";
import {PresenterSubscribeResponse} from "../dto/presenter-subscribe-response";
import {PollClientComponent} from "../poll/poll-client/poll-client.component";
import {NotFoundComponent} from "../not-found/not-found.component";
import {WaitComponent} from "../wait/wait.component";

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  groupName: string | null = "";

  @ViewChild(AnchorDirective, {static: true}) anchor!: AnchorDirective;

  viewContainerRef ? : ViewContainerRef ;

  constructor(
    private route: ActivatedRoute,
    private queueService : QueueService,
    private groupService : GroupService,
  ) {}

  ngOnInit(): void {
    // Retrieve route parameter /:group from url
    this.route.paramMap.subscribe( params => {
      this.groupName = params.get("group");
      if(this.groupName){
        this.groupService.setGroupName(this.groupName);
      }
    });
    this.viewContainerRef = this.anchor.viewContainerRef;

    // Show "waiting" while presenter has not initialized yet
    const waitingComponent = this.viewContainerRef.createComponent<WaitComponent>(WaitComponent);

    // Listen to all presenter events for choosing which component to choose
    this.queueService.onPresenterEvent<PresenterSubscribeResponse>( presenterEvent=> {
      if(!this.viewContainerRef){
        console.error("Error: Container ref is empty");
        return;
      }
      if(presenterEvent.interaction === "poll"){
        this.viewContainerRef.clear(); // clean container
        const pollClientRef = this.viewContainerRef.createComponent<PollClientComponent>(PollClientComponent);
        pollClientRef.instance.populateWithData(presenterEvent);
      }else {
        const ref404 = this.viewContainerRef.createComponent<NotFoundComponent>(NotFoundComponent);
        console.error("Error: No matching interaction id was found for " + presenterEvent.interaction);
      }
    });
  }

}
