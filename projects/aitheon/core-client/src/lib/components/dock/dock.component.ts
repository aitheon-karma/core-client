import { Component, OnInit, HostBinding, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'ai-dock',
  templateUrl: './dock.component.html',
  styleUrls: ['./dock.component.scss']
})
export class DockComponent implements OnInit {

  @HostBinding('class.active') isActive: boolean = false;
  isSelectOpen = false;
  isSelectFirstOpen = false;
  isChanged = false;
  services_all: Array<any>;
  services: Array<any>;
  services_selected_id: Array<string>;
  services_selected_id_copy: Array<string>;
  services_selected: Array<any>;
  DEFAULT_ID: Array<string> = ['MESSAGES', 'MAILBOX', 'COMMUNITY', 'MARKETPLACE', 'CONTACTS'];
  MAX_LENGTH = 6;
  ls = window.localStorage;

  @Input() currentUser: any;

  toggleDock() {
    if (this.isActive) {
      this.isSelectOpen = false;
      if(this.isChanged) {
        this.updateDockServices();
      } else {
        this.isActive = false;
      }
    } else {
      this.isActive = true;
    }
  }

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.services.subscribe((services: Array<any>) => {
      this.services_all = services.filter((s: any) => s.showAtMenu);

      if (!(typeof this.currentUser.dockServices !== 'undefined' && this.currentUser.dockServices.length > 0)) {
        console.log('user dont have dockServices');
        let names = [];
        let names_selected = [];
        this.services_all.forEach((item) => {
          names.push(item._id);
          if (this.DEFAULT_ID.indexOf(item._id) !== -1) {
            names_selected.push(item._id);
          }
        });
        if (names_selected.length < this.DEFAULT_ID.length) {
          let i = 0;
          while((names_selected.length < this.DEFAULT_ID.length) && (i < names.length)) {
            if (names_selected.indexOf(names[i]) == -1) {
              names_selected.push(names[i]);
            }
            i++;
          }
        }
        this.services_selected_id = names_selected;
        this.isChanged = true;
        this.updateDockServices();

      } else {
        this.services_selected_id = this.currentUser.dockServices;
      }

      this.services_selected_id_copy = this.services_selected_id;

      this.updateObjects();
    });
  }

  openSelect() {
    if (!this.isSelectOpen) {
      this.isSelectFirstOpen = true;
      this.isSelectOpen = true;
    }
  }

  closeSelect() {
    if (this.isActive && this.isSelectOpen && !this.isSelectFirstOpen) {
      this.isSelectOpen = false;
    }
    this.isSelectFirstOpen = false;
  }

  closeDockOnClickOutside() {
    if(this.isActive && !this.isSelectOpen && !this.isChanged) {
      this.isActive = false;
    }
  }

  updateObjects() {
    this.services = this.services_all.filter((item) => {
      return this.services_selected_id.indexOf(item._id) == -1;
    });

    this.services_selected = [];
    this.services_selected_id.forEach((item) => {
      for(let i = 0; i < this.services_all.length; i++) {
        if(item === this.services_all[i]._id) {
          this.services_selected.push(this.services_all[i]);
        }
      }
    });

    if (this.services_selected.length < this.MAX_LENGTH) {
      for (var i = 0; this.services_selected.length < this.MAX_LENGTH; i++)  {
        this.services_selected.push(false);
      }
    }
  }

  updateDockServices() {
    if(this.isChanged) {
      this.authService.updateDockService(this.services_selected_id).subscribe((g) => {
        this.isActive = false;
        this.isChanged = false;
      }, (err) => {
        console.log(err);
      });
    }
  }

  addService(id) {
    if ((this.services_selected_id.indexOf(id) == -1) && (this.services_selected_id.length < this.MAX_LENGTH)) {
      this.services_selected_id.push(id);
      this.updateObjects();
      this.isChanged = true;
    }
  }

  removeService(id) {
    this.services_selected_id = this.services_selected_id.filter(i => i !== id);
    this.updateObjects();
    this.isChanged = true;
  }

  drop(event: CdkDragDrop<{title: string, poster: string}[]>) {
    moveItemInArray(this.services_selected, event.previousIndex, event.currentIndex);
    this.services_selected = this.services_selected.sort((a, b) => {
      return b ? 1 : -1;
    });
    this.services_selected_id = this.services_selected.map(s => s._id).filter(s => s);
    this.isChanged = true;
  }
}
