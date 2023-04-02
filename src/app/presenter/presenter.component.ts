import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {QueueService} from "../queue.service";
import {GroupService} from "../group.service";
import {AnchorDirective} from "../anchor.directive";
import {QueryToEventService} from "./query-to-event.service";
import {ComponentChooserService} from "../component-chooser.service";
import {PresenterMessage} from "../presenter-message";


@Component({
  selector: 'app-presenter',
  templateUrl: './presenter.component.html',
  styleUrls: ['./presenter.component.css']
})
export class PresenterComponent implements OnInit {
  groupName: string | null = "";
  @ViewChild(AnchorDirective, {static: true}) anchor!: AnchorDirective;

  constructor(
    private route: ActivatedRoute,
    private queueService : QueueService,
    private groupService : GroupService,
    private queryToEventService : QueryToEventService,
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

    // Listen to all presenter events for determining which component to choose
    this.queueService.listenToPresenterInbox<PresenterMessage>(presenterMessage => {
      this.componentChooserService.injectComponent(this.anchor.viewContainerRef,
                                                      presenterMessage.interaction, "presenter",presenterMessage);
    });

    // Retrieve query parameter ?param1=value1&param2=... from url and publish as presenter event
    this.queryToEventService.publishIfValid(this.route.snapshot.queryParamMap);
  }
}
