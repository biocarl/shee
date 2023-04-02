import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QueueService} from "../queue.service";
import {GroupService} from "../group.service";
import {PresenterSubscribeResponse} from "../dto/presenter-subscribe-response";
import {PollClientComponent} from "../poll/poll-client/poll-client.component";
import {NotFoundComponent} from "../not-found/not-found.component";
import {WaitComponent} from "../wait/wait.component";
import {AnchorDirective} from "../anchor.directive";
import {ComponentChooserService} from "../component-chooser.service";

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
    private componentChooserService : ComponentChooserService
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
      this.componentChooserService.injectComponent(this.anchor.viewContainerRef,
        presenterEvent.interaction, "client",presenterEvent);
    });
  }
}
