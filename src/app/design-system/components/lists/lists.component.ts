import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {
  namesForDropdown = [
    {
      name: 'David Anderson',
      icon: 'icon--hierarchy-tree',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Bob Anderson',
      icon: 'icon--add-sub-task',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Ted Anderson',
      icon: 'icon--subtask',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Anna Anderson',
      icon: 'icon--share',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Sara Anderson',
      icon: 'icon--add-company',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Ted Anderson',
      icon: 'icon--subtask',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Anna Anderson',
      icon: 'icon--share',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Sara Anderson',
      icon: 'icon--add-company',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Ted Anderson',
      icon: 'icon--subtask',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Anna Anderson',
      icon: 'icon--share',
      path: '/assets/img/avatar.jpg'
    },
    {
      name: 'Sara An',
      icon: 'icon--add-company',
      path: '/assets/img/avatar.jpg'
    }
  ];


  constructor() { }

  ngOnInit() {
  }

}
