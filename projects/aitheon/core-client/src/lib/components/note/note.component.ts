import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Output,
  ViewChild,
  OnDestroy,
  EventEmitter,
  forwardRef,
  OnChanges,
  SimpleChanges,
  Optional,
  Inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from '@aitheon/ckeditor';
import { Note } from '../../services/note';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';

import { AI_CORE_CLIENT_OPTIONS } from '../../core-client.tokens';
import { ICoreClientOptions } from '../../core-client.options';

interface Position {
  left?: number | string;
  right?: number | string;
  top: number | string;
}

const formatString = item => item && item.toString().trim();

@Component({
  selector: 'ai-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NoteComponent),
    multi: true
  }],
})
export class NoteComponent implements OnChanges, OnDestroy {
  @ViewChild('textEditor') textEditor: CKEditorComponent;

  @Input() required = false;
  @Input() note: Note;
  @Input() taskOrReminderInProgress: boolean;
  @Output() createTask = new EventEmitter<{ value: string, isForAllNote: boolean }>();
  @Output() openReminder = new EventEmitter<{ value: string | any, isForAllNote: boolean }>();
  @Output() removeReminderDate = new EventEmitter<void>();
  @Output() removeNote = new EventEmitter<void>();
  @Output() removeAssignedItem = new EventEmitter<{
    note: Note,
    taskId: string,
  }>();

  value = null;
  timeouts = [];
  editor = Editor;
  editorConfig = {
    toolbar: [],
    placeholder: 'Write a Note',
  };
  isOpen = false;
  isHighlightTooltipOpen = false;
  focused = false;
  position: Position;
  trianglePosition: any;
  activeHighlight: any;
  mouseLeaved = false;
  showContent = false;
  tagReplaceRegExp = new RegExp('(<([^>]+)>)|(&nbsp;)', 'ig');
  creationStarted = false;
  isHighlightHovered = false;
  dateFormat = 'MMM dd, hh:mm aaa';
  textNote = '';

  private static getSelectionPosition(): any {
    const range = NoteComponent.getSelectionRange();

    if (range.startOffset === range.endOffset) {
      return null;
    }

    const rect = range.getBoundingClientRect();
    return {
      left: rect.left - 142 + rect.width / 2,
      top: rect.top - 27,
      triangleX: (rect.left + rect.width / 2),
      right: rect.right,
    };
  }

  private static getHighlightPosition(x: number, y: number) {
    return {
      left: x - 142,
      top: y - 32,
      right: x,
      triangleX: x,
    };
  }

  private static getSelectionRange() {
    const selection = window.getSelection();
    return selection.getRangeAt(0);
  }

  constructor(
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
    private router: Router,
  ) {}

  // CONTROL_VALUE_ACCESSOR SECTION
  onChange: (_: any) => void = (_: any) => {};
  onTouched: () => void = () => {};

  updateChanges() {
    if (this.creationStarted || !this.checkValue()) {
      this.onChange(this.value);
    }
  }

  writeValue(value: number): void {
    this.value = value;
    this.updateChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  // END OF CONTROL_VALUE_ACCESSOR SECTION

  ngOnChanges(changes: SimpleChanges): void {
    const { taskOrReminderInProgress, note } = changes;
    if (taskOrReminderInProgress && !taskOrReminderInProgress.firstChange) {
      if (!taskOrReminderInProgress.currentValue) {
        this.creationStarted = false;
        this.updateChanges();
      }
    }
    if (note && !note.firstChange) {
      this.updateChanges();
    }
  }

  checkValue() {
    const flatAssignedArray = [
      ...this.getNoteField('assignedTasks', []),
      ...this.getNoteField('assignedReminders', []),
    ].map(({ text }) => formatString(text));
    if (this.getValue().includes('<i>')) {
      const iRegExp = new RegExp('<\s*i[^>]*>(.*?)<\s*/\s*i>', 'g');
      let resultValue = formatString(this.getValue());
      const highlightedArray = (resultValue.match(iRegExp) || []).map(item => formatString(item));
      for (const value of highlightedArray) {
        const plainValue = formatString(value.replace(this.tagReplaceRegExp, ''));
        if (!flatAssignedArray.includes(plainValue)) {
          const formatted = value.replace(/(<([i>]+)>)?(<([/i>]+)>)/g, '');
          resultValue = resultValue.replace(value, formatted);
        }
      }
      this.value = resultValue;
      this.onChange(resultValue);
      return true;
    }
    return false;
  }

  private getValue() {
    if (this.textEditor && this.textEditor.editorInstance) {
      return this.textEditor.editorInstance.getData();
    }
    return this.value || '';
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    event.stopPropagation();
    if (this.focused) {
      this.timeouts.push(setTimeout(() => {
        this.show();
      }, 50));
    } else {
      this.hide();
    }
  }

  onMouseMove(event: MouseEvent) {
    event.stopPropagation();
    // @ts-ignore
    const isITagInPath = event.path.find(item => item.tagName === 'I');
    if (!isITagInPath || this.focused || this.isOpen) {
      this.mouseLeaved = true;
      this.isHighlightTooltipOpen = false;
      return;
    }
    if (isITagInPath && this.isHighlightTooltipOpen) {
      return;
    }
    this.mouseLeaved = false;
    this.getActiveHighlight(isITagInPath);
    const highlightPosition = NoteComponent.getHighlightPosition(event.clientX, event.clientY);
    const editorPosition = this.getEditorPosition();
    this.setPosition(highlightPosition, editorPosition);
    this.timeouts.push(setTimeout(() => {
      if (!this.mouseLeaved) {
        this.isHighlightTooltipOpen = true;
      }
    }, 400));
  }

  private getActiveHighlight(element: Element) {
    const innerText = formatString(element.innerHTML.replace(this.tagReplaceRegExp, ''));
    this.activeHighlight = [
      ...this.getNoteField('assignedTasks', []),
      ...this.getNoteField('assignedReminders', []),
    ].find(({ text }) => text.trim() === innerText);
  }

  private setPosition(position: any, parentPosition: any): void {
    const relativePosition = parentPosition.right - ((position.right + position.left) / 2);
    let triangleXPosition = 0;
    if (position.left < parentPosition.left) {
      this.position = {
        left: 0,
        top: `${position.top - parentPosition.top}px`,
      };
      triangleXPosition = position.triangleX - parentPosition.left;
    }
    if (relativePosition < 140) {
      this.position = {
        top: `${position.top - parentPosition.top}px`,
        right: '5px',
      };
      this.trianglePosition = {
        bottom: '-10px',
        right: `${parentPosition.right - position.right - 7}px`,
      };
      return;
    }
    if (!triangleXPosition) {
      this.position = {
        left: `${position.left - parentPosition.left}px`,
        top: `${position.top - parentPosition.top}px`,
      };
    }
    this.trianglePosition = {
      bottom: '-10px',
      left: triangleXPosition ? `${triangleXPosition - 7}px` : '47%',
    };
  }

  private getEditorPosition(): any {
    // @ts-ignore
    const editor: ElementRef = <any>(this.textEditor).elementRef;
    const rect = editor.nativeElement.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
    };
  }

  setSelected(event: Event, type: string) {
    event.stopPropagation();
    event.preventDefault();
    this.textEditor.editorInstance.commands.get(type).execute();
    this.hide();
  }

  focus() {
    this.focused = true;
  }

  highlightSelected() {
    this.textEditor.editorInstance.commands.get('italic').execute();
  }

  get selected() {
    const selection = this.textEditor.editorInstance.model.document.selection;
    const range = selection.getFirstRange();

    const result = [];
    for (const item of range.getItems()) {
      result.push(item.data);
    }
    return result.join('');
  }

  public getData(): string {
    try {
      return this.textEditor.editorInstance.getData().replace(this.tagReplaceRegExp, '');
    } catch (e) {
      return '';
    }
  }

  hide() {
    this.isOpen = false;
    this.focused = false;
  }

  public show(): void {
    const position = NoteComponent.getSelectionPosition();
    if (!position) {
      return this.hide();
    }
    const editorPosition = this.getEditorPosition();
    this.setPosition(position, editorPosition);
    this.isOpen = true;
  }

  toggleShow(event: Event, canHide: boolean) {
    if (canHide) {
      if (this.isOpen) {
        this.hide();
      }
      return this.showContent = !this.showContent;
    }
    this.showContent = true;
  }


  onOpenTaskDialog(isForAllNote?: boolean) {
    this.creationStarted = true;
    let value = '';
    if (isForAllNote) {
      value = this.value.replace(this.tagReplaceRegExp, '');
    } else {
      this.highlightSelected();
      value = this.selected;
      this.hide();
    }
    this.createTask.emit({
      value,
      isForAllNote: !!isForAllNote,
    });
  }

  onOpenReminder(event, isForAll?: boolean) {
    this.creationStarted = true;
    event.stopPropagation();
    event.preventDefault();

    if (isForAll) {
      this.openReminder.emit({
        value: this.getData(),
        isForAllNote: true,
      });
    } else {
      this.highlightSelected();
      this.openReminder.emit({
        value: this.selected,
        isForAllNote: false,
      });
    }
    this.hide();
  }

  onOpenExistingReminder(reminder: any) {
    if (reminder) {
      this.openReminder.emit({
        value: reminder,
        isForAllNote: true,
      });
    }
  }

  onRemoveReminderDate(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.removeReminderDate.emit();
  }

  onRemoveNote(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.removeNote.emit();
  }

  onRemoveAssignedItem(assigned?: any) {
    const { _id } = assigned || this.activeHighlight;
    if (_id) {
      const updatedNote = {
        ...this.note,
        assignedTasks: this.note.assignedTasks.filter(task => task._id !== _id),
        assignedReminders: this.note.assignedReminders.filter(reminder => reminder._id !== _id),
      } as Note;
      this.removeAssignedItem.emit({
        note: updatedNote,
        taskId: _id,
      });
    }
  }

  onRemoveReminder() {
    this.removeAssignedItem.emit({
      note: {
        ...this.note,
        reminder: null,
      },
      taskId: this.note.reminder._id,
    });
  }

  onRemoveTask() {
    this.removeAssignedItem.emit({
      note: {
        ...this.note,
        task: null,
      },
      taskId: this.note.task._id,
    });
  }

  get isNoteLong() {
    return this.value && this.value.length > 100;
  }

  get assignedTasksAmount() {
    if (this.note) {
      let amount = 0;
      if (this.note.task) {
        amount = 1;
      }
      return amount + this.note.assignedTasks.length;
    }
  }

  get assignedRemindersAmount() {
    if (this.note) {
      let amount = 0;
      if (this.note.reminder) {
        amount = 1;
      }
      return amount + this.note.assignedReminders.length;
    }
  }

  handleSpeechFound(userSpeech) {
    this.value = this.textNote ? `${this.textNote}<br />*** ${userSpeech} ***` : userSpeech;
    this.updateChanges();
  }

  startListen(isListen) {
    if (isListen === true && this.value !== null && this.value !== '') {
      this.textNote = this.value;
    }
  }

  getNoteField(field, defaultValue: any) {
    if (this.note) {
      return this.note[field] || defaultValue;
    }
    return defaultValue;
  }

  get assignedTasks() {
    const assignedTasks = this.getNoteField('assignedTasks', []);
    if (assignedTasks.length === 1) {
      return assignedTasks[0].task && assignedTasks[0].task.name || '1 Task';
    }
    if (assignedTasks.length > 1) {
      return `${assignedTasks.length} Tasks`;
    }
    return '';
  }

  get assignedReminders() {
    const assignedReminders = this.getNoteField('assignedReminders', []);
    if (assignedReminders.length === 1) {
      return assignedReminders[0].reminder && assignedReminders[0].reminder.finishDate;
    }
    if (assignedReminders.length > 1) {
      return `${assignedReminders.length} Reminders`;
    }
    return '';
  }

  goToTask(task?: any) {
    let id, projectId;
    if (!task) {
      const { task: highlightTask = {} } = this.activeHighlight || {};
      const { _id, project } = highlightTask;
      id = _id;
      projectId = project;
    } else {
      id = task._id;
      projectId = task.project;
    }
    if (id && projectId) {
      if (this.options.service === 'PROJECT_MANAGER') {
        this.router.navigate(
          ['/projects', projectId, 'boards'],
          {
            queryParams: {
              task: id,
            },
          });
        return;
      }
      window.location.href = `/project-manager/projects/${projectId}/boards?task=${id}`;
    }
  }

  toggleHighlight() {
    this.isHighlightHovered = !this.isHighlightHovered;
  }

  ngOnDestroy(): void {
    for (const timeout of this.timeouts) {
      clearTimeout(timeout);
    }
  }
}
