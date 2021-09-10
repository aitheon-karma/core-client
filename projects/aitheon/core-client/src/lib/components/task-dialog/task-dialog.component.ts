import { Component, OnInit, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService, BsDatepickerDirective } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { TasksService } from '../../services/tasks.service';
import { TaskType, CoreServices, Task } from '../../services/notification';
import { DriveUploaderComponent } from '../drive-uploader/drive-uploader.component';

@Component({
  selector: 'ai-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit {

  @ViewChild('taskDialogTmpl') taskDialogTmpl: TemplateRef<any>;
  @ViewChild('driveUploader') driveUploader: DriveUploaderComponent;
  @ViewChild(BsDatepickerDirective) datepicker: BsDatepickerDirective;
  @Output() taskCreated: EventEmitter<any> = new EventEmitter<any>();
  taskDialogRef: BsModalRef;
  taskForm: FormGroup;
  mechbotForm: FormGroup;
  error: any;
  toggle = false;
  lockForm = false;
  submitted = false;
  assignToSystemOption = [];
  devices: any[];
  isDeviceEnabled: boolean;
  selectedOther = 'SERVICE';
  TaskType = TaskType;
  loadingFromSystem = false;
  loadingToSystem = false;
  selectedType: string = TaskType.TASK;
  taskTypes = Object.keys(TaskType).map((value: string) => {
    const result = { value: value.toString(), label: value.charAt(0) + value.slice(1).toLowerCase() };
    return result;
  }).filter(type => type.value !== TaskType.NOTIFICATION);
  others = [
    { value: 'SERVICE', label: 'Service' },
    { value: 'MECHBOT', label: 'Mechbot' }
  ];
  serviceKey: any;
  activeOrganization: any;
  currentUser: any;
  services: any[];
  allowedMimeType = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/x-iwork-pages-sffpages' // .pages
  ];
  users: any[];
  hours: any[] = [];
  effortHours: number[] = [];
  taskOptions = [
    'Move Robot',
    'Custom Move Robot'
  ];
  systemTypeOptions: any = [
    'SYSTEM', 'GROUP', 'MACHINE'
  ];
  positionTypeOptions: any = [
    'Station Entry', 'Station Exit', 'Goto Pose'
  ];
  fromStationOptions = [];
  toStationOptions = [];
  stateOptions = [
    'PENDING',
    'IN_PROGRESS'
  ];
  systemOptions = ['RCP'];
  subSystemOptions = [];
  files: any[] = [];
  ghostFocus = false;
  systemOptionsConfig = {
    displayKey: 'name',
    placeholder: 'Select system'
  };
  positionTypeConfig = {
    placeholder: 'Select Position Type'
  };
  stationConfig = {
    displayKey: 'name',
    placeholder: 'Select Station'
  };

  positionArray = [];

  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private authService: AuthService,
    private tasksService: TasksService
  ) {
  }

  ngOnInit() {
    for (let i = 0; i < 24; i++) {
      this.hours.push({
        name: `${i}:00`,
        value: i
      });
    }
    for (let i = 1; i <= 100; i++) {
      this.effortHours.push(i);
    }
    this.buildForm();
    this.buildMechbotForm();
    this.getSystemType();
    if (this.activeOrganization && this.activeOrganization.services.includes('DEVICE_MANAGER')) {
      this.tasksService.listDevices().subscribe((devices: any[]) => {
        this.devices = devices;
        this.isDeviceEnabled = true;
      }, (err) => {
        this.isDeviceEnabled = false;
      }
      );
    } else {
      this.devices = [];
      this.isDeviceEnabled = false;
    }
    this.authService.activeOrganization.subscribe((organization: any) => {
      this.activeOrganization = organization;
      this.authService.currentUser.subscribe((user: any) => {
        this.currentUser = user;
        if (organization) {
          this.serviceKey = {
            _id: 'USERS',
            key: `${this.activeOrganization._id}`
          };
          this.setServices(organization.services);
          this.tasksService.listOrgUsers(this.activeOrganization._id).subscribe((users: any[]) => {
            this.users = users.map((u: any) => {
              const result = Object.assign({} as any, u, { fullName: `${u.profile.firstName} ${u.profile.lastName}` });
              return result;
            });
          });
        } else {
          this.others = [{ value: 'SERVICE', label: 'Service' }];
          this.serviceKey = {
            _id: 'USERS',
            key: `${this.currentUser._id}`
          };
          this.setServices(user.services);
        }
      });
    });
    this.addPositionArray();
    // this.addInitialPosition();
    // get Systems from device-manager
    this.getSystemDetails();
  }

  addPosition() {
    return {
      positionType: '',
      stations: '',
      poses: [
        {
          sequence: '',
          velocity: '',
          rotation: {
            poseRotationX: '',
            poseRotationY: '',
            poseRotationZ: '',
            poseRotationW: '',
          },
          translation: {
            poseTranslationX: '',
            poseTranslationY: '',
            poseTranslationZ: '',
          }

        }
      ]
    };
  }

  buildForm() {
    this.taskForm = this.fb.group({
      name: ['', [Validators.required]],
      service: [''],
      assigned: [''],
      finishDate: [new Date(), [Validators.required]],
      dueTime: [''],
      effortMin: [''],
      effortMax: [''],
      assignedToDevice: [''],
      description: ['', [Validators.required]]
    });
  }

  buildMechbotForm() {
    this.mechbotForm = this.fb.group({
      name: [''],
      description: [''],
      task: ['Move Robot'],
      parentTask: [''],
      subsystemType: [''],

      assignedToSystem: [''],
      service: [''],
      toStation: [''],
      fromStation: [''],
      system: [''],
      position: []
    });
    // this.addInitialPosition();
  }

  getSystemType() {
    if (this.activeOrganization && this.activeOrganization.services.includes('DEVICE_MANAGER')) {
      this.tasksService.getSystemType().subscribe((sysTypeList) => {
        this.systemTypeOptions = sysTypeList;
      });
    }
  }

  pose() {
    return {
      sequence: '',
      velocity: '',
      rotation: {
        poseRotationX: '',
        poseRotationY: '',
        poseRotationZ: '',
        poseRotationW: '',
      },
      translation: {
        poseTranslationX: '',
        poseTranslationY: '',
        poseTranslationZ: '',
      }
    };
  }

  addPositionArray() {
    this.positionArray.push(this.addPosition());
  }

  addPoses(index) {
    this.positionArray[index].poses.push(this.pose());
  }

  removePose(positionIndex, posesIndex) {
    this.positionArray[positionIndex].poses.splice(posesIndex, 1);
  }

  removePosition(positionIndex) {
    this.positionArray.splice(positionIndex, 1);
  }

  show() {
    this.taskDialogRef = this.modalService.show(this.taskDialogTmpl, Object.assign({}, { class: 'modal-lg modal-mt' }));
  }

  onTaskSelected(selectedTask) {
    if (selectedTask.value === 'Custom Move Robot') {

    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.taskForm.invalid) {
      return;
    }
    const formValue = this.taskForm.value;
    const { name, description, finishDate, service } = formValue;
    const type = this.selectedType;
    const estimateHours = {
      min: formValue.effortMin,
      max: formValue.effortMax
    };
    const task = {
      name,
      description,
      finishDate,
      service,
      type,
      estimateHours
    } as any;
    if (this.selectedOther === 'SERVICE') {
      const assigned = this.activeOrganization ? formValue.assigned.map(a => a._id) : [this.currentUser._id];
      task.assigned = assigned;
    }
    if (this.selectedOther === 'MECHBOT') {
      const assignedToDevice = [formValue.assignedToDevice._id];
      task.assignedToDevice = assignedToDevice;
      task.service = 'SMART_INFRASTRUCTURE';
    }
    if (formValue.dueTime) {
      task.finishDate.setHours(Number(formValue.dueTime.value));
    }
    if (this.files.length) {
      task.files = this.files;
    }
    if (this.activeOrganization) {
      task.organization = this.activeOrganization._id;
    }
    this.tasksService.createTask(task).subscribe((createdTask: Task) => {
        this.toastr.success('Task created');
        this.files = [];
        this.taskDialogRef.hide();
      },
      err => this.toastr.error(err.message || err));
  }

  setServices(services: any[] = []) {
    services = services.filter((name: string) => !CoreServices[name]);
    const tempObject = {} as any;
    for (const service of services) {
      tempObject[service] = '';
    }
    this.services = Object.keys(tempObject);
  }

  onSuccessUpload(event: any) {
    const file = {
      _id: event._id,
      name: event.name,
      signedUrl: event.signedUrl,
      contentType: event.contentType
    };
    this.files.push(file);
  }

  selectOther(other: string) {
    this.selectedOther = other;
    this.selectedType = TaskType.TASK;
  }

  selectType(type: string) {
    this.selectedType = type;
  }

  ghostInputFocus() {
    this.ghostFocus = !this.ghostFocus;
  }

  // 5d7d00b009a15f000fb6dc29
  getSystemDetails(parentId: any = '') {
    if (parentId === '') {
      if (this.activeOrganization && this.activeOrganization.services.includes('DEVICE_MANAGER')) {
      this.tasksService.getSystem().subscribe((sysList) => {
        this.systemOptions = sysList;
      });
    }
    } else {
      if (this.activeOrganization && this.activeOrganization.services.includes('DEVICE_MANAGER')) {
      this.tasksService.getSystem(this.mechbotForm.value.system._id).subscribe((systemList): any => {
        this.loadingFromSystem = true;
        this.loadingToSystem = true;
        this.subSystemOptions = systemList;
        this.fromStationOptions = this.toStationOptions = systemList;
        this.loadingFromSystem = false;
        this.loadingToSystem = false;
        this.filterSystemByType('Group');
        // this.filterFromSystemOptions();
        // this.filterToSystemOptions();
      });

    }
  }

  }

  onSystemSelect(event) {
    this.getSystemDetails(event.value._id);
  }

  onSubsystemTypeSelect(event) {
    this.filterSystemByType(event.value);
  }

  onSubsystemSelect() {
  }

  filterSystemByType(type: any = '') {
    if (type !== '') {
      let dummylist = [];
      dummylist = this.subSystemOptions;
      this.assignToSystemOption = [];
      this.assignToSystemOption = dummylist.filter((sys) => {
        return sys.type.name === type;
      });
      // this.fromStationOptions = this.toStationOptions = this.subSystemOptions;
    }
  }

  filterFromSystemOptions() {
    this.loadingFromSystem = true;
    // let arr = this.subSystemOptions;
    this.fromStationOptions = this.subSystemOptions.filter(element => {
      return element !== this.mechbotForm.value.toStation;
    });
    this.loadingFromSystem = false;
  }

  filterToSystemOptions() {
    this.loadingToSystem = true;
    // let arr = this.subSystemOptions;
    this.toStationOptions = this.subSystemOptions.filter(element => {
      return element !== this.mechbotForm.value.fromStation;
    });
    this.loadingToSystem = false;
  }

  createTask() {
    if (this.selectedOther !== 'SERVICE') {
      if (this.mechbotForm.invalid) {
        console.log('Invalid =>', this.mechbotForm.controls);
        return;
      } else {

        console.log('valid =>', this.mechbotForm.controls);
        const taskPayload = new Task;

        if (this.mechbotForm.value.task === 'Custom Move Robot') {
          console.log('poses payload=>', this.positionArray);
          // Custom payload for positions
          const payload = [];
          for (let i = 0; i < this.positionArray.length; i++) {
            if (this.positionArray[i].positionType === 'Station Entry') {
              const customPayload = {
                sequence: i + 1,
                type: 'stationEntry',
                station: this.positionArray[i].stations['_id']
              };
              payload.push(customPayload);
            } else if (this.positionArray[i].positionType === 'Station Exit') {
              const customPayload = {
                sequence: i + 1,
                type: 'stationExit',
                station: this.positionArray[i].stations['_id']
              };
              payload.push(customPayload);
            } else if (this.positionArray[i].positionType === 'Goto Pose') {
              const customPayload = {
                sequence: i + 1,
                type: 'goto',
                pose: this.positionArray[i].poses
              };
              payload.push(customPayload);
            }
          }
          console.log('Custom Position => ', payload);
          taskPayload.name = 'Create Task from control panel';
          taskPayload.description = 'Custom Move Robot ';
          taskPayload.state = 'PENDING';
          taskPayload.type = 'TASK';
          taskPayload.recurring = false;
          taskPayload.createdBy = this.currentUser._id;
          taskPayload.service = 'SMART_INFRASTRUCTURE';
          taskPayload.assignedToSystem = this.mechbotForm.value.assignedToSystem['_id'];
          taskPayload.organization = this.activeOrganization._id;
          taskPayload.action = {
            name: 'Custom Move Robo',
            data: payload,
            redirect: '',
            referenceId: ''
          };
          console.log('submit ==>', taskPayload);
          this.tasksService.createCustomTask(taskPayload).subscribe((response): any => {
              this.taskCreated.emit();
              this.resetFormData();
              this.taskDialogRef.hide();
            },
            (error) => {
              console.log(error);
            });
        } else {
          taskPayload.name = 'Create Task from control panel';
          taskPayload.description = this.mechbotForm.value.description;
          taskPayload.state = 'PENDING';
          taskPayload.type = 'TASK';
          taskPayload.recurring = false;
          taskPayload.createdBy = this.currentUser._id;
          taskPayload.service = 'SMART_INFRASTRUCTURE';
          taskPayload.assignedToSystem = this.mechbotForm.value.assignedToSystem['_id'];
          taskPayload.organization = this.activeOrganization._id;
          taskPayload.action = {
            name: 'ROBO_' + this.mechbotForm.value.fromStation.name + '_TO_' + this.mechbotForm.value.toStation.name,
            data: {
              fromSystem: this.mechbotForm.value.fromStation['_id'],
              toSystem: this.mechbotForm.value.toStation['_id']
            },
            redirect: '',
            referenceId: ''
          };
          console.log('submit ==>', taskPayload);
          this.tasksService.createTask(taskPayload).subscribe((response): any => {
              this.taskCreated.emit();
              this.resetFormData();
              this.taskDialogRef.hide();
            },
            (error) => {
              console.log(error);
            });
        }

      }
    }
  }

  resetFormData() {
    this.mechbotForm.reset();
    this.positionArray = [];
    this.addPositionArray();
  }

  hide() {
    this.taskDialogRef.hide();
  }
}
