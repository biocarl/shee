import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QueueService } from '../queue.service';
import { GroupService } from '../group.service';
import { WaitComponent } from '../wait/wait.component';
import { AnchorDirective } from '../anchor.directive';
import { ComponentChooserService } from '../component-chooser.service';
import { PresenterMessage } from '../presenter-message';
import { ParticipantService } from '../participant.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
})
export class ClientComponent implements OnInit {
  groupName: string | null = '';
  participantName: string | null = '';

  @ViewChild(AnchorDirective, { static: true }) anchor!: AnchorDirective;

  viewContainerRef?: ViewContainerRef;

  constructor(
    private route: ActivatedRoute,
    private queueService: QueueService,
    private groupService: GroupService,
    private componentChooserService: ComponentChooserService,
    private participantService: ParticipantService
  ) {}

  ngOnInit(): void {
    // Retrieve route parameter /:group from url
    this.route.paramMap.subscribe((params) => {
      this.groupName = params.get('group');
      if (this.groupName) {
        this.groupService.setGroupName(this.groupName);
      }
    });
    this.route.queryParamMap.subscribe((params) => {
      this.participantName = params.get('user');
      if (this.participantName) {
        this.participantService.setParticipantName(this.participantName);
      }
    });
    this.viewContainerRef = this.anchor.viewContainerRef;

    // Show "waiting" while presenter has not initialized yet
    this.viewContainerRef.createComponent<WaitComponent>(WaitComponent);

    // Listen to all presenter messages and inject component into view accordingly
    this.queueService.listenToPresenterChannel<PresenterMessage>(
      (presenterMessage) => {
        this.componentChooserService.injectComponent(
          this.anchor.viewContainerRef,
          presenterMessage.interaction,
          'client',
          presenterMessage
        );
      }
    );
  }
}
