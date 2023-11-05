import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { Roles } from '../security/authRequestDto.model';
import { NewPrivilegeDto, Privilege, PrivilegeDto } from '../teachers/teacher.model';

@Component({
  selector: 'app-roles-privilege',
  templateUrl: './roles-privilege.component.html',
  styleUrls: ['./roles-privilege.component.css']
})
export class RolesPrivilegeComponent implements OnInit {

  constructor(private service: CampusService, private modalService: NgbModal) { }

  closeResult: any;

  ngOnInit(): void {
    this.getRoles();
    this.initializeCreateForm();
    this.initializeEditPrivilegeForm();
    this.initializeCreatePrivilegeForm();
    this.setDefaulltValue();
  }

  initializeCreateForm() {
    this.createRoleForm = new FormGroup({
      'rolename': new FormControl(null)
    });
  }
  initializeEditPrivilegeForm() {
    this.editPrivilegeForm = new FormGroup({
      'permissions': new FormControl()
    });

  }
  initializeCreatePrivilegeForm(){
    this.createPrivilegeForm = new FormGroup({
      'privilegename': new FormControl(null, Validators.required)
    });
  }
  setDefaulltValue() {
    this.createRoleForm.patchValue({
      rolename: ""
    });
  }

  createRoleForm: FormGroup;
  editPrivilegeForm: FormGroup;
  createPrivilegeForm: FormGroup;
  open(createContent: any) {
    
    this.setDefaulltValue();
    this.modalService.open(createContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openCreatePrivilege(createContent: any) {
    this.getAllPrivilege();
    this.modalService.open(createContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  allPermissions: NewPrivilegeDto;
  allPrivilegesOfRoles: Privilege[];
  selectedItems: Privilege[] = new Array();
  onEdit(updateContent: any, inService: any) {
    let selectedData: NewPrivilegeDto = {
      roleId: inService.id
    }
    let response = this.service.getAllPrivilegeRoles(selectedData);
    response.subscribe((data: any) => {
      this.allPermissions = data;
      console.log("All Permission: ", this.allPermissions);

      this.allPrivilegesOfRoles = this.allPermissions.privilegeList;
      this.selectedItems = [];
      this.allPrivilegesOfRoles.forEach(ele => {
        let selectedItem2: Privilege = {
          id: ele.id,
          name: ele.name,
          selected: true
        }
        this.selectedItems.push(selectedItem2);
      });
      console.log("Selected Roles: ", this.selectedItems);
    });

    this.modalService.open(updateContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  editPrivilegeRole(createContent: any) {

    this.getAllPrivileges();
    this.modalService.open(createContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  roleList: any;
  getRoles() {
    let response = this.service.getAllRoles();
    response.subscribe((data: any) => {
      // this.roleList = data;
      console.log(data);
      this.roleList = data;
    },
      ((error: any) => {
        console.log(error);

      }));
  }

  privileges: Privilege[];
  getAllPrivileges() {
    let response = this.service.getAllPrivileges();
    response.subscribe((data: any) => {
      this.privileges = data;
      
      this.privileges.forEach(ele => {
        var index = this.privileges.indexOf(ele);
        // console.log("Got index: ", index);
        let selected: Privilege = {
          id: ele.id,
          name: ele.name,
          selected: false
        }
        this.privileges.splice(index, 1, selected);
      });
      console.log("All Previlege: ", this.privileges);
      this.setCheckedProperty();
      
    });
  }

  private setCheckedProperty() {
    this.selectedItems.forEach(ele => {
      if (ele.selected == true) {
        var index = this.privileges.findIndex(obj => {
          return obj.id === ele.id;
        });
        let selected: Privilege = {
          id: ele.id,
          name: ele.name,
          selected: true
        };
        
        this.privileges.splice(index, 1, selected);        
        
        // this.privileges.push(selected);
        // this.getPrivilegeId(null,ele.id);
      }
    });
  }

  getPrivilegeId(e: any | null, item: Privilege) {

    if (e.target.checked) {
      this.selectedItems.push(item);
      console.log("Selected Items: ", this.selectedItems);
    } else {
      this.selectedItems = this.selectedItems.filter(del => del.id != item.id);
      console.log("Selected Items: ", this.selectedItems);
    }
  }


  

  onSubmit() {
    let privilegeId: number[] = new Array();
    this.selectedItems.forEach(ele => {
      privilegeId.push(ele.id);
    });
    let priviDto: PrivilegeDto = {
      roleId: this.allPermissions.roleId,
      privilegeId: privilegeId
    }
    console.log("Data Going to backend: ", priviDto);
    let response = this.service.saveprivileges(priviDto);
    response.subscribe((data:any) => {
      console.log("Got from backend: ", data);
      Swal.fire("Success!","Permissions Saved.", 'success');
      this.modalService.dismissAll();
    });
  }

  submitRole(){
    let newRole: Roles = {
      name: this.createRoleForm.value.rolename
    }
    let response = this.service.createNewRole(newRole);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        Swal.fire(data.result, data.message, 'success');
        this.modalService.dismissAll();
      } else {
        Swal.fire("Sorry", "Something went wrong.", 'error');
      }
    });
    
  }

  submitPrivilege(){
    let privilege: Privilege = {
      name: this.createPrivilegeForm.value.privilegename
    }
    let response = this.service.createPrivilege(privilege);
    response.subscribe((data:any) => {
      if (data.result.toUpperCase() == "SUCCESS") {
        Swal.fire(data.result, data.message, 'success');
        this.initializeCreatePrivilegeForm();
        this.getAllPrivilege();
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  privilegeList: Privilege[];
  getAllPrivilege(){
    let response = this.service.getAllPrivileges();
    response.subscribe((data:any) => {
      this.privilegeList = data;
    });
  }

}
