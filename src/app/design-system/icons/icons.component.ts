import { Component, OnInit, Directive, HostListener } from '@angular/core';


@Component({
  selector: 'app-icons',
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.scss']
})

export class IconsComponent implements OnInit {

  iconsContentArr = ['icon--file', 'icon--new-file', 'icon--new-folder', 'icon--closed-folder', 'icon--open-folder', 'icon--node', 'icon--attach', 'icon--scan', 'icon--image', 'icon--archive', 'icon--grid-view', 'icon--list-view', 'icon--collapse-content', 'icon--expand-content', 'icon--article', 'icon--new-article', 'icon--widget'];

  iconsArrowsArr = ['icon--chevron-left', 'icon--chevron-up', 'icon--chevron-right', 'icon--chevron-down', 'icon--arrow-prev', 'icon--arrow-next', 'icon--table-sort', 'icon--arrow-left', 'icon--arrow-up', 'icon--arrow-right', 'icon--arrow-down', 'icon--arrow-drop-down', 'icon--arrow-drop-up', 'icon--arrow-drop-right', 'icon--arrow-drop-left', 'icon--text-area-responsive' ];

  iconsInfoArr = ['icon--block', 'icon--question-help', 'icon--attention', 'icon--info', 'icon--unlock', 'icon--lock', 'icon--tick', 'icon--done-success', 'icon--label', 'icon--cloud', 'icon--pin', 'icon--code', 'icon--task', 'icon--shapes', 'icon--storage', 'icon--board', 'icon--gantt', 'icon--mindmap', 'icon--epic', 'icon--globus', 'icon--currency', 'icon--add-deal', 'icon--cryptocurrency', 'icon--debit-card', 'icon--debit-card-wrong', 'icon--dice', 'icon--flag', 'icon--help', 'icon--phone', 'icon--libra', 'icon--lunch', 'icon--treasury'];

  iconsEventsArr = ['icon--clock', 'icon--sound', 'icon--mute', 'icon--timer', 'icon--assignment', 'icon--calendar', 'icon--date', 'icon--forecast'];

  iconsActionsArr = ['icon--cancel-circle-o', 'icon--cancel-circle-f', 'icon--create-add', 'icon--delete', 'icon--plus', 'icon--print', 'icon--update', 'icon--add-photo', 'icon--done-all', 'icon--upload', 'icon--split-mode', 'icon--show', 'icon--hide', 'icon--inbox', 'icon--switch', 'icon--play', 'icon--create-column', 'icon--refresh', 'icon--download', 'icon--filter', 'icon--duplicate', 'icon--drag', 'icon--zoom-in', 'icon--zoom-out', 'icon--minus', 'icon--minus-for-checkboxes', 'icon--full-screen', 'icon--full-screen-exit', 'icon--share', 'icon--link', 'icon--unlink', 'icon--hierarchy-tree', 'icon--add-sub-task', 'icon--subtask', 'icon--history', 'icon--pause', 'icon--clear-all', 'icon--redo', 'icon--undo', 'icon--skip'];

  iconsToolsArr = ['icon--align-right', 'icon--align-center', 'icon--align-left', 'icon--italic', 'icon--underline-text', 'icon--font', 'icon--bold', 'icon--edit', 'icon--text-color', 'icon--bullet-list', 'icon--font-size', 'icon--numbered-list', 'icon--remove-formatting-list'];

  iconsSocialArr = ['icon--emoji', 'icon--sticker', 'icon--comment', 'icon--message', 'icon--like', 'icon--like-filled', 'icon--new-post', 'icon--user', 'icon--group', 'icon--new-user', 'icon--contacts', 'icon--send', 'icon--star', 'icon--star-half-fill', 'icon--star-filled', 'icon--spam', 'icon--unread', 'icon--open-mail', 'icon--chat', 'icon--forward', 'icon--repost', 'icon--company', 'icon--add-company', 'icon--reply', 'icon--reply-all'];

  iconsNavlArr = ['icon--menu', 'icon--more', 'icon--settings', 'icon--open-in-new-tab', 'icon--parameters', 'icon--bookmark', 'icon--close', 'icon--cart', 'icon--search', 'icon--notification', 'icon--control-panel', 'icon--logout', 'icon--home'];

  constructor() {
    
  }

  ngOnInit() {

  }

  getIconsNames() {

  }

  @HostListener('document:click', ['$event'])

  closeItemActive(event) {
    let listIcons = event.currentTarget;
    let iconWrap = listIcons.querySelector('.list-icons__item--active');
    if (iconWrap) {
      if (!event.target.closest('.list-icons__item')) {
        iconWrap.classList.remove('list-icons__item--active');
      }
    }
    return;
  }

  isItemActive(event) {

    if (event.target.classList.contains('list-icons')) { return; }

    let items = document.querySelectorAll('.list-icons__item');

    if (event.target.closest('.list-icons__item--active')) {
      event.target.classList.remove('list-icons__item--active');
      event.target.closest('.list-icons__item').classList.remove('list-icons__item--active');
    } else {
      for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('list-icons__item--active');
      }
      if (event.target.closest('.list-icons__item')) {
      }
      event.target.closest('.list-icons__item').classList.add('list-icons__item--active');
    }

    if (event.target.closest('.choise-element')) {
      event.target.closest('.list-icons__item').classList.add('list-icons__item--active');
    }

  }
}
