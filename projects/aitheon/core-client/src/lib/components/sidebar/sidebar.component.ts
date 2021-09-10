import { AuthService } from '../../services/auth.service';
import { Component, Input, Output, EventEmitter, HostBinding, OnInit, ViewChild } from '@angular/core';
import { CreateSectionFormComponent } from './create-section-form/create-section-form.component';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ServiceGroupsService } from '../../services/service-groups.service';
import * as _ from 'lodash';
import { ServiceGroup } from '../../services/service-group';


@Component({
  selector: 'ai-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: [
    './sidebar.component.scss',
    './sidebar.component.dark.scss'
  ]
})

export class SidebarComponent implements OnInit {
  @Input()
  @HostBinding('class.opened')
  opened = false;

  @HostBinding('class.hidden')
  hidden = false;

  @Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  services: Array<any>;
  allServices: Array<any>;
  servicesLength: number;

  @ViewChild('createSection') createSection: CreateSectionFormComponent;

  editStateSidebar: boolean = false;

  checkedArray: any;
  listName: string;
  serviceGroups: any[] = [];
  generalGroup: any;
  currentUser: any;

  serviceListOpened: boolean;

  constructor(
    public authService: AuthService,
    private serviceGroupsService: ServiceGroupsService
  ) { }

  ngOnInit() {
    forkJoin([this.authService.services.pipe(first()), this.serviceGroupsService.list().toPromise(), this.authService.currentUser.pipe(first())]).subscribe((result: any) => {
      this.currentUser = result[2];
      this.allServices = this.services = result[0].filter((s: any) => s.showAtMenu);
      this.serviceGroups = result[1];
      this.getGeneralServices(this.serviceGroups);
    });
    this.editStateSidebar = false;
  }

  getGeneralServices(serviceGroups: any[]) {
    const groupedServices = [];
    for (const group of serviceGroups) {
      groupedServices.push(...group.services);
    }
    const groupedServicesIds = groupedServices.map(s => s._id);
    this.services = this.services.filter(s => !groupedServicesIds.includes(s._id));
  }

  hide(): void {
    this.hidden = true;
  }

  close(): void {
    this.opened = false;
    this.openedChange.emit(false);
  }

  closeEditMode() {
    this.editStateSidebar = false;
  }

  showCreateSection(event, group: ServiceGroup) {
    event.stopPropagation();
    this.createSection.show(group);
  }

  openServicesList(event) {
    this.serviceListOpened = !this.serviceListOpened;
    let wrapServicesList = event.target.closest('.list-services-wrap');
    wrapServicesList.classList.toggle('list-services-wrap--open');
  }

  onCheckedArray(event: Event) {
    this.checkedArray = event;
  }

  takeListName(event: string) {
    this.listName = event;
  }

  onGroupSave(group: ServiceGroup) {
    this.serviceGroups = [group, ...this.serviceGroups];
    this.getGeneralServices([group]);
  }

  onUpdateGroup(group: ServiceGroup) {
    this.serviceGroups = this.serviceGroups.map((g: ServiceGroup) => {
      if (group._id === g._id) {
        this.services = [...this.services, ...g.services];
        g.services = [...group.services];
        g.name = group.name;
      }
      return g;
    });
    this.getGeneralServices([group]);
  }

  onRemoveGroup(groupId: string) {
    const removedGroup = this.serviceGroups.find(g => g._id === groupId);
    if (!removedGroup) return;
      this.serviceGroups = this.serviceGroups.filter(g => g._id !== groupId);
      this.services = [...this.services, ...removedGroup.services];
  }

}
