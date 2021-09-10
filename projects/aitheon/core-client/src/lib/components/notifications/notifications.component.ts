import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  TemplateRef,
  OnChanges,
  ElementRef,
  HostListener
} from '@angular/core';
import { HostBinding } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { TasksService } from '../../services/tasks.service';
import { Task, TaskType, CoreServices } from '../../services/notification';
// import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { GenericModalComponent } from '../generic-modal/generic-modal.component';
import { forkJoin } from 'rxjs';
import { first, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AbstractControl } from '@angular/forms';
import { Note } from '../../services/note';
import { NotesService } from '../../services/notes.service';
import { AuthService } from '../../services/auth.service';
import { FileViewerService } from '../file-viewer/file-viewer.service';
import { element } from '@angular/core/src/render3';

export class DealFile {
  name: string;
  contentType: string;
  signedUrl: string;
  createdAt: Date;
  filename: string;
  mimetype: string;
  path: string;
  createdBy: any;
}

@Component({
  selector: 'ai-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnChanges {
  @Input() sortedTasks: any;
  @Input() tasksCounter: {
    assigned: number,
    unassigned: number
  };
  @Input() notificationsCounter: number;
  @Output() remove: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() changeType: EventEmitter<string> = new EventEmitter<string>();
  @Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @ViewChild('taskDialog') taskDialog: TaskDialogComponent;
  @ViewChild('clockedInInfo') clockedInInfo: GenericModalComponent;
  @ViewChild('stopStartedTask') stopStartedTask: GenericModalComponent;
  @ViewChild('taskDetailsModal') taskDetailsModal: TemplateRef<any>;
  @ViewChild('reminderModal') reminderModal: TemplateRef<any>;
  @ViewChild(BsDatepickerDirective) datepicker: BsDatepickerDirective;
  @ViewChild('taskModal') taskModal: TemplateRef<any>;

  @ViewChild('ownerName') epicSearch: ElementRef;

  @Input()
  @HostBinding('class.opened')
  opened = false;
  tabType = 'NOTIFICATIONS';

  isOpenMarketMessages = false;
  isOpenHumanMessages = false;
  isOpenDriveMessages = false;
  marketMessage: number[] = [1, 2, 3, 4, 5];
  sortedTasksNames: string[];
  loading = false;
  // taskDetailsModalRef: BsModalRef;
  reminderModalRef: BsModalRef;
  // taskModalRef: BsModalRef;
  selectedTask: Task;
  activeTaskId: string;
  videoTypes = ['video/mp4', 'video/quicktime', 'video/x-flv', 'video/3gpp', 'video/x-msvideo', 'video/x-ms-wmv'];
  imageTypes = ['image/png', 'image/jpeg'];
  taskRunning: boolean;
  taskTime = 0;
  task: Task;
  currentUser: any;
  activeOrganization: any;
  services: any[] = [];
  startedTask: Task;

  newNoteForm: FormGroup;
  notesForm: FormGroup;
  userNotes: Note[] = [];
  openNotesIds = [];
  isNoteLong = true;
  hidden = false;
  selectedNote: Note;

  // Reminder variables
  dateConfig = {
    isAnimated: true,
    dateInputFormat: 'MMM D, YYYY',
    showWeekNumbers: false
  };
  maxDate: Date = new Date();
  minDate = new Date();
  reminderForm: FormGroup;
  isForAllNote: boolean;
  highLightedText: string;
  reminderSubmitted = false;
  openedReminder: Task;
  showDocumentViewerForm = false;
  filesArray = [];
  filesReceived: boolean = false;

  constructor(
    private tasksService: TasksService,
    private notesService: NotesService,
    private modalService: BsModalService,
    private authService: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private fileViewerService: FileViewerService,
  ) {
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 13 && event.shiftKey) {
      if (this.newNoteForm && this.newNoteForm.valid) {
        const newNote: Note = {
          text: this.newNoteControl.value.replace('<br>&nbsp;', ''),
          assignedTasks: []
        };
        this.createNote(newNote);
      }
      this.newNoteForm = null;
    }
  }

  ngOnInit() {
    this.loading = true;
    this.minDate.setFullYear(this.minDate.getFullYear() - 1);
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);
    this.taskRunning = false;
    forkJoin([this.authService.currentUser.pipe(first()), this.authService.activeOrganization.pipe(first())]).subscribe((result: any) => {
      this.currentUser = result[0];
      this.activeOrganization = result[1];
      if (this.activeOrganization) {
        this.setServices(this.activeOrganization.services);
      } else {
        this.setServices(this.currentUser.services);
      }
    });
    this.notesService.list().subscribe((notes: Note[]) => {
      this.userNotes = notes;
    });
  }

  goToTab(tab: string) {
    this.tabType = tab;
    this.loading = true;
    this.changeType.emit(tab);
    if (tab === 'NOTES') {
      this.initNotesForm();
    }
  }

  /////////////////  Task tab section  //////////////////////////////////////////

  setServices(services: any[] = []) {
    this.services = services.filter((name: string) => !CoreServices[name]).map((name: string) => ({ name }));
  }

  ngOnChanges() {
    if (this.sortedTasks) {
      this.loading = false;
      this.sortedTasksNames = Object.keys(this.sortedTasks);
    }
  }

  close(): void {
    this.opened = false;
    this.openedChange.emit(false);
  }

  get isSomeOpened() {
    return Object.keys(this.sortedTasks).some(
      service => {
        if (this.sortedTasks[service].isUnassignedTasksOpened || this.sortedTasks[service].isOpened) {
          return true;
        }
        return false;
      }
    );
  }

  toggleOpen(service: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.activeTaskId = null;
    this.sortedTasks[service].isOpened = true;
  }

  collapseAll() {
    const services = Object.keys(this.sortedTasks);

    services.forEach((service: string) => {
      this.activeTaskId = null;
      this.sortedTasks[service].isOpened = false;
      this.sortedTasks[service].isUnassignedTasksOpened = false;
    });
  }

  toggleClose(service: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.activeTaskId = null;
    this.sortedTasks[service].isOpened = false;
    this.sortedTasks[service].isUnassignedTasksOpened = false;
  }

  toggleTasksClose(service: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.sortedTasks[service].isTasksOpened = !this.sortedTasks[service].isTasksOpened;
  }

  toggleUnassignedTasksClose(service: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.sortedTasks[service].isUnassignedTasksOpened = !this.sortedTasks[service].isUnassignedTasksOpened;
  }

  removeTask(tasksIds: string[], redirect: boolean, redirectPath: string = '', done: boolean = false) {
    event.preventDefault();
    event.stopPropagation();
    const request$ = done ? this.tasksService.markAsDone(tasksIds) : this.tasksService.markAsRead(tasksIds);
    const services = [];
    for (const name of this.sortedTasksNames) {
      if (this.sortedTasks[name].isOpened) {
        services.push(name);
      }
    }
    this.remove.emit(services);
    request$.subscribe((res: Task) => {
      if (redirect) {
        window.location.href = redirectPath;
      }
    });
  }

  onRemoveTasks(event: Event, type: string, target: string = '') {
    event.preventDefault();
    event.stopPropagation();
    switch (type) {
      case 'ONE':
        this.removeTask([target], false);
        break;
      case 'SERVICE':
        const serviceTasks = this.sortedTasks[target].tasks.map(t => t._id);
        this.removeTask(serviceTasks, false);
        break;
      case 'ALL':
        const allTasks = [];
        for (const name of this.sortedTasksNames) {
          this.sortedTasks[name].tasks.map(t => {
            allTasks.push(t._id);
          });
        }
        this.removeTask(allTasks, false);
        break;
    }
  }

  goToTask(task: Task, redirectPath: string) {
    const redirect = !task.action || !task.action.name ? redirectPath : task.action.redirect;
    if (task.action && task.action.name === 'organization-invite') {
      return;
    }
    const openModal = task.action && task.action.redirect;
    if (task.type === TaskType.TASK && !openModal) {
      this.selectedTask = task;
      this.selectedTask['serviceName'] = this.sortedTasks[this.selectedTask.service].serviceName;
    } else {
      this.removeTask([task._id], true, redirect);
    }

  }

  // showTaskDialog() {
  //   this.taskDialog.show();
  // }

  convertTextId(id: string) {
    return id.split('_').map(text => text.toLowerCase()).join(' ');
  }

  assignToMe(event: Event, task: Task, service: string) {
    event.stopPropagation();
    event.preventDefault();
    this.tasksService.assignToMe(task).subscribe((res: Task) => {
        this.sortedTasks[service].unassignedTasks = this.sortedTasks[service].unassignedTasks.filter((t: Task) => {
          return t._id !== res._id;
        });
        this.sortedTasks[service].tasks = [...this.sortedTasks[service].tasks, task];
        if (this.tasksCounter) {
          ++this.tasksCounter.assigned;
          --this.tasksCounter.unassigned;
        }
      },
      err => this.toastr.error('Can not be assigned'));
  }



  toggleTaskDetails(task: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (task._id === this.activeTaskId) {
      this.activeTaskId = null;
      return;
    }
    this.activeTaskId = task._id;
    this.filesArray = task.files;
  }

  openFile(url: any) {
    window.open(url, '_blank');
  }

  async toggleStartTask(task: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (task.taskRunning) {
      await this.tasksService.stop(task._id).toPromise();
      this.sortedTasks[task.service].tasks.map((t: any) => {
        if (t._id === task._id) {
          t.taskRunning = false;
        }
        return t;
      });
      return;
    }
    const performClockCheck = this.services.find((service) => service.name === 'HR');
    if (performClockCheck) {
      const isEmployee = (this.activeOrganization && this.activeOrganization.services.includes('HR'))
        ? await this.tasksService.isEmployee().toPromise()
        : false;
      if (isEmployee) {
        const isClockedIn = await this.tasksService.isClockedIn().toPromise();
        if (!isClockedIn) {
          return this.clockedInInfo.show({ text: `You are not clocked in.\nDo you want to clock in now?`, payload: task });
        }
      }
    }
    this.processStartTask(task);
  }

  doClockIn(task: any) {
    this.tasksService.clockin().subscribe(() => {
      this.processStartTask(task);
    });
  }

  processStartTask(task: any) {
    this.tasksService.getStartedTask(task.organization).subscribe((startedTask: Task) => {
      if (!startedTask) {
        this.startedTask = task;
        return this.startTask(task);
      }
      if (startedTask._id === task._id) {
        return this.toastr.error('Sorry, this task is already started. Try to reload page');
      }
      return this.stopStartedTask
        .show({
          headlineText: 'Do you want to start tracking another task?',
          additionalConfirmText: 'PAUSE',
          text: `You have to pause the previous task or mark it “Done”`,
          confirmText: 'Mark as Done',
          payload: {
            taskToStart: task,
            taskToStop: startedTask,
          }
        });

    });
  }

  async markAsDone(task: any) {
    try {
      if (task.taskRunning) {
        await this.tasksService.stop(task._id).toPromise();
        this.sortedTasks[task.service].tasks.map((t: any) => {
          if (t._id === task._id) {
            t.taskRunning = false;
          }
          return t;
        });
      }
      await this.tasksService.markAsDone([task._id]).toPromise();
      this.removeTask(
        [task._id],
        false,
        '',
        true,

      );
    } catch (e) {
      this.toastr.error(e.error || e);
    }
  }

  async onConfirmMarkAsDone(data: any) {
    try {
      const { taskToStart, taskToStop } = data;
      await this.tasksService.stop(taskToStop._id).toPromise();
      this.sortedTasks[taskToStop.service].tasks.map((t: any) => {
        if (t._id === taskToStop._id) {
          t.taskRunning = false;
        }
        return t;
      });
      await this.tasksService.markAsDone([taskToStop._id]).toPromise();
      this.sortedTasks[taskToStop.service].tasks = this.sortedTasks[taskToStop.service].tasks.filter((t: any) => {
        return t._id !== taskToStop._id;
      });
      this.startTask(taskToStart);
    } catch (e) {
      this.toastr.error(e.error || e);
    }

  }

  async pauseTask(data: any) {
    try {
      const { taskToStart, taskToStop } = data;
      await this.tasksService.stop(taskToStop._id).toPromise();
      this.sortedTasks[taskToStop.service].tasks.map((t: any) => {
        if (t._id === taskToStop._id) {
          t.taskRunning = false;
        }
        return t;
      });
      this.startTask(taskToStart);
    } catch (e) {
      this.toastr.error(e.error || e);
    }
  }

  startTask(task: any) {
    this.tasksService.start(task._id).subscribe(() => {
      this.sortedTasks[task.service].tasks.map((t: any) => {
        if (t._id === task._id) {
          t.taskRunning = true;
        }
        return t;
      });
      this.sortedTasks[task.service].tasks = this.sortedTasks[task.service].tasks.sort((a: any, b: any) => {
        return a.taskRunning ? -1 : 1;
      });
      this.sortedTasksNames = Object.keys(this.sortedTasks).sort((a: any, b: any) => {
        return a === task.service ? -1 : 1;
      });
      const newSort = {} as any;
      this.sortedTasksNames.forEach((service: string) => {
        newSort[service] = { ...this.sortedTasks[service] };
      });
      this.sortedTasks = { ...newSort };
    });
  }

  /////////////////  Notification tab section  //////////////////////////////////////////

  reviewNotification(service: string, event: Event, task: Task) {
    event.preventDefault();
    event.stopPropagation();
    if (this.sortedTasks[service].isOpened || this.sortedTasks[service].tasks.length === 1) {
      const redirectPath = this.sortedTasks[service].service.url;
      this.goToTask(task, redirectPath);
      return;
    }
  }

  acceptOrgInvite(task: Task) {
    this.tasksService.acceptOrgInvite(task.action.referenceId).subscribe(() => {
      this.removeTask([task._id], false);
    });
  }

  declineOrgInvite(task: Task) {
    this.tasksService.declineOrgInvite(task.action.referenceId).subscribe(() => {
      this.removeTask([task._id], false);
    });
  }

  /////////////////  Reminder section  //////////////////////////////////////////

  openReminder(data: { value: string | any, isForAllNote: boolean }, note: Note) {
    this.isForAllNote = data.isForAllNote;
    this.selectedNote = note;
    this.reminderModalRef = this.modalService.show(this.reminderModal, {
      class: 'modal-md'
    });
    if (typeof data.value === 'object') {
      this.openedReminder = data.value.reminder;
      this.setReminderForm(data.value);
      return;
    }
    this.highLightedText = data.value;
    this.setReminderForm(data.value);
  }

  removeReminderDate(note: Note) {
    this.tasksService.removeTask(note.reminder._id).subscribe(() => {
      const newNote = { _id: note._id, reminder: null } as Note;
      this.notesService.updateNote(newNote).subscribe((updatedNote: Note) => {
        this.userNotes = this.userNotes.map(n => n._id === updatedNote._id ? updatedNote : n);
      });
    });
  }

  onValueChange() {
    if (!this.reminderForm.touched) {
      this.reminderForm.markAsTouched();
    }
  }

  closeReminderModal() {
    this.reminderModalRef.hide();
    this.selectedNote = null;
    this.reminderForm = null;
    this.reminderSubmitted = false;
    this.openedReminder = null;
  }

  saveReminder() {
    this.reminderSubmitted = true;
    if (!this.reminderForm.valid) {
      return;
    }
    const formValue = this.reminderForm.value;
    const hours = formValue.reminderTime.getHours();
    const minutes = formValue.reminderTime.getMinutes();
    const finishDate = new Date(formValue.reminderDate);
    finishDate.setHours(hours);
    finishDate.setMinutes(minutes);
    const task = {
      name,
      description: formValue.description,
      finishDate,
      type: 'NOTIFICATION'
    } as any;
    if (this.activeOrganization) {
      task.organization = this.activeOrganization._id;
    }
    if (this.openedReminder) {
      this.updateReminder(task);
      return;
    }
    this.tasksService.createTask(task).subscribe((reminder: Task) => {
        const note = {
          _id: this.selectedNote._id
        } as Note;
        if (this.isForAllNote) {
          note.reminder = reminder._id;
        } else {
          const assignedReminders = this.selectedNote.assignedReminders.filter(i => i.reminder).map((item: any) => {
            return { reminder: item.reminder._id, text: item.text };
          });
          note.assignedReminders = [...assignedReminders, { reminder: reminder._id, text: this.highLightedText }];
        }
        this.notesService.updateNote(note).subscribe((updatedNote: Note) => {
          this.userNotes = this.userNotes.map(n => n._id === updatedNote._id ? updatedNote : n);
          this.closeReminderModal();
        });
      },
      err => this.toastr.error(err.message || err));
  }

  updateReminder(task: {
    description: string,
    finishDate: Date,
    name: string,
    organization: string,
    type: string,
  }) {
    const reminder = this.openedReminder;
    const updatedReminder = {
      ...reminder,
      ...task,
      finishDate: task.finishDate.toISOString(),
    } as Task;
    this.tasksService.updateTask(updatedReminder, updatedReminder._id)
      .subscribe((response: Task) => {
          let updatedNote: Note;
          if (this.selectedNote.reminder && this.selectedNote.reminder._id === updatedReminder._id) {
            updatedNote = {
              ...this.selectedNote,
              reminder: response,
            } as Note;
          } else {
            updatedNote = {
              ...this.selectedNote,
              assignedReminders: this.selectedNote.assignedReminders.map(assignedReminder => {
                if (assignedReminder._id === response._id) {
                  return {
                    ...assignedReminder,
                    reminder: response,
                  };
                }
                return assignedReminder;
              })
            } as Note;
          }
          this.notesService.updateNote(updatedNote).subscribe((updated: Note) => {
            this.userNotes = this.userNotes.map(n => n._id === updated._id ? updated : n);
            this.closeReminderModal();
          });
        },
        err => this.toastr.error(err.message || err),
      );
  }

  setReminderForm(data: string | any) {
    const reminder = data.reminder;
    if (reminder) {
      this.reminderForm = new FormGroup({
        reminderDate: new FormControl(new Date(reminder.finishDate), [Validators.required]),
        reminderTime: new FormControl(new Date(reminder.finishDate), [Validators.required]),
        description: new FormControl(reminder.description),
      });
      return;
    }
    this.reminderForm = new FormGroup({
      reminderDate: new FormControl(null, [Validators.required]),
      reminderTime: new FormControl(null, [Validators.required]),
      description: new FormControl(this.htmlToString(data))
    });
  }

  /////////////////  Task creation section  //////////////////////////////////////////

  createTaskDialog(data: { value: string, isForAllNote: boolean }, note: Note) {
    const { value: description, isForAllNote } = data;
    this.highLightedText = description;
    this.selectedNote = note;
    this.isForAllNote = isForAllNote;
  }

  onTaskFormClose() {
    this.selectedNote = undefined;
  }

  onTaskCreate(task: Task) {
    const note = {
      _id: this.selectedNote._id
    } as Note;
    if (this.isForAllNote) {
      note.task = task._id;
    } else {
      const assignedTasks = this.selectedNote.assignedTasks.filter(i => i.task).map((item: any) => {
        return { task: item.task._id, text: item.text };
      });
      note.assignedTasks = [...assignedTasks, { task: task._id, text: this.highLightedText }];
    }
    this.updateNote(note);
  }

  /////////////////  Notes section  //////////////////////////////////////////

  initNewNoteForm(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.newNoteForm = new FormGroup({
      note: new FormControl(
        null,
        [
          Validators.required,
          Validators.minLength(3),
        ]),
    });
  }

  removeNoteAssignedItem(data: { note: Note, taskId: string }) {
    this.tasksService.removeTask(data.taskId).subscribe(() => {
      this.updateNote(data.note);
    });
  }

  updateNote(note: Note) {
    return this.notesService.updateNote(note)
      .subscribe((updatedNote: Note) => {
          this.userNotes = this.userNotes
            .map(n => n._id === updatedNote._id ? updatedNote : n);
          this.selectedNote = null;
        },
        err => this.toastr.error(err.message || err)
      );
  }

  get newNoteControl() {
    try {
      return this.newNoteForm.get('note');
    } catch (e) {
      return null;
    }
  }

  get notesControls() {
    try {
      return <FormArray>this.notesForm.get('notes');
    } catch (e) {
      return null;
    }
  }

  createNote(note: Note) {
    this.notesService.createNote(note).subscribe((newNote: Note) => {
      this.userNotes = [
        newNote,
        ...this.userNotes,
      ];
      const noteControl = this.createNoteControl(newNote);
      this.notesControls.insert(0, noteControl);
      this.subscribeControlChanges(noteControl);
    });
  }

  createNoteControl(note: Note) {
    return new FormGroup({
      text: new FormControl(note.text, Validators.required),
      _id: new FormControl(note._id),
      task: new FormControl(note.task),
      reminder: new FormControl(note.reminder),
      assignedTasks: new FormControl(note.assignedTasks),
    });
  }

  initNotesForm() {
    this.notesForm = new FormGroup({
      notes: new FormArray(this.getNotesControls()),
    });

    const controls = (<FormArray>this.notesForm.get('notes')).controls;
    for (const control of controls) {
      this.subscribeControlChanges(control);
    }

  }

  subscribeControlChanges(control: AbstractControl) {
    control.valueChanges.pipe(distinctUntilChanged(), debounceTime(2000)).subscribe((note: any) => {
      this.notesService.updateNote(note).subscribe((newNote: Note) => {
        this.updateNoteFromChanges(newNote);
      });
    });
  }

  updateNoteFromChanges(note: Note) {

  }

  getNotesControls() {
    return this.userNotes.map((note: Note) => new FormGroup({
      text: new FormControl(note.text, Validators.required),
      _id: new FormControl(note._id),
      task: new FormControl(note.task),
      reminder: new FormControl(note.reminder),
      assignedTasks: new FormControl(note.assignedTasks),
    }));
  }

  removeNote(note: Note) {
    this.notesService.removeNote(note._id).subscribe(() => {
      this.userNotes = this.userNotes.filter((n: Note) => {
        return n._id !== note._id;
      });
    });
  }

  onToggleTextNote(noteId: string, open?: boolean) {
    const isNoteAdded = this.openNotesIds.includes(noteId);
    if (!open && isNoteAdded) {
      this.openNotesIds = this.openNotesIds.filter(id => id !== noteId);
      return;
    }
    if (isNoteAdded) {
      return;
    }
    this.openNotesIds.push(noteId);

  }

  htmlToString(html: string) {
    const regExp = new RegExp('(<([^>]+)>)|(&nbsp;)', 'ig');
    return html.replace(regExp, '');
  }

  trackById(index, item) {
    return item._id;
  }

  trackByItem(index, item) {
    return item;
  }

  goToProject(projectId: string, taskId?: string) {
    window.location.href = `/project-manager/projects/${projectId}/boards${taskId ? `?task=${taskId}` : ''}`;
  }

  onPreviewFileOpen(file: any, e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.filesReceived = true;
    let openTimeout = setTimeout(()=> {
      this.fileViewerService.changeStatus(file);
      clearTimeout(openTimeout);
    }, 10)
  }

  onCloseViewer() {
    this.filesReceived = false;
  }
}
