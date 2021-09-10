import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AuthService } from '../../../services/auth.service';
import { FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { ServiceGroupsService } from '../../../services/service-groups.service';
import { ServiceGroup } from '../../../services/service-group';


@Component({
  selector: 'ai-create-section-form',
  templateUrl: './create-section-form.component.html',
  styleUrls: ['./create-section-form.component.scss']
})

export class CreateSectionFormComponent implements OnInit {

  @ViewChild('sectionFormTmpl') sectionFormTmpl: TemplateRef<any>;
  @Output() onSave = new EventEmitter<any>();
  @Output() onUpdate = new EventEmitter<any>();
  @Output() onRemove = new EventEmitter<string>();
  @Input() services: any[];
  @Input() allServices: any[];

  createSectionFormRef: BsModalRef;
  errorInput: boolean = false;
  checkedServices: any[];
  groupName: string;
  isNew: boolean;
  groupId: string;

  createSectionForm: FormGroup;
  adminService = {
    _id: 'ADMIN',
    name: 'Admin service',
    url: '/admin',
    showAtMenu: true
  };

  constructor(
    private modalService: BsModalService,
    private serviceGroupsService: ServiceGroupsService,
    public authService: AuthService
  ) {}

  ngOnInit() {

  }

  buildForm() {
    this.createSectionForm = new FormGroup({
      "nameServiceList": new FormControl(this.groupName, [Validators.min(3), Validators.required]),
      "checkedServices": new FormArray([], this.minLengthArray(1)),
    });
    this.checkedServices.forEach(service => {
      this.servicesArray.push(new FormGroup({
        _id: new FormControl(service._id),
        checked: new FormControl(true),
        name: new FormControl(service.name),
        url: new FormControl(service.url)
      }));
    });
    this.services.forEach(service => {
      this.servicesArray.push(new FormGroup({
        _id: new FormControl(service._id),
        checked: new FormControl(false),
        name: new FormControl(service.name),
        url: new FormControl(service.url)
      }));
    });
  }

  get servicesArray() {
    return this.createSectionForm.get('checkedServices') as FormArray;
  }

  show(group: ServiceGroup) {
    this.createSectionFormRef = this.modalService.show(this.sectionFormTmpl, Object.assign({}, { class: 'modal-md modal-mt' }));
    this.checkedServices = group.services;
    this.groupName = group.name;
    this.isNew = !group.name;
    this.groupId = group._id ? group._id : undefined;
    this.buildForm();
  }

  close() {
    this.createSectionFormRef.hide();
    this.buildForm();
  }

  isServiceGroupChecked() {
    const value = this.servicesArray.value;
    const filterValue = value.filter(s => s.checked);
    const filterValueId = filterValue.map(s => s._id);
    return filterValueId;
  }

  onSubmit() {
    const checkedServices = this.isServiceGroupChecked();
    const newGroup = {
      name: this.createSectionForm.get('nameServiceList').value,
      services: checkedServices
    };
    this.saveGroup(newGroup);
  }

  saveGroup(group: ServiceGroup) {
    const services = this.allServices.filter((s: any) => {
      return group.services.includes(s._id);
    });
    if (this.isNew) {
      this.serviceGroupsService.createGroup(group).subscribe((savedGroup: ServiceGroup) => {
        this.onSave.emit({...group, services, _id: savedGroup._id});
        this.close();
      },
      err => console.log(err));
    } else {
      group._id = this.groupId;
      this.serviceGroupsService.updateGroup(group).subscribe((savedGroup: ServiceGroup) => {
        this.onUpdate.emit({...group, services});
        this.close();
      },
      err => console.log(err));
    }
  }

  minLengthArray(min: number) {
    return (c: AbstractControl): { [key: string]: any } => {
      const checkedArray = c.value.filter(s => s.checked);
      if (checkedArray.length >= min)
        return null;

      return { 'minLengthArray': { valid: false } };
    }
  }

  remove() {
    this.serviceGroupsService.removeGroup(this.groupId).subscribe(() => {
      this.onRemove.emit(this.groupId);
      this.close();
    });
  }

}
