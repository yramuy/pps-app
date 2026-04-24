import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-issue-create',
  templateUrl: './issue-create.component.html',
  styleUrls: ['./issue-create.component.scss'],
})
export class IssueCreateComponent {
  message: string = '';
  isMessage: boolean = false;

  states: any = [];
  districts: any = [];
  assemblies: any = [];
  mandals: any = [];
  villages: any = [];
  categories: any = [];
  representatives: any = [];

  loginUser: any;

  issue: any = {
    id: '',
    category_id: '',
    issue_title: '',
    issue_description: '',
    state_id: '',
    district_id: '',
    assembly_id: '',
    mandal_id: '',
    village_id: '',
    assigned_to: '',
    issue_pic: '',
    master_id: '9',
    mode: 'web',
  };

  isEdit: boolean = false;

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  baseUrl = 'https://civsp.in/pps';

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadStates();
    this.loadCategories();

    const state: any = history.state;

    // ✅ Edit Mode Data Binding
    if (state.issue) {
      this.issue = state.issue;
      this.isEdit = true;

      // ✅ Set preview from existing image
      if (this.issue.issue_pic) {
        this.imagePreview = this.issue.issue_pic;
      }

      console.log('imagePreview', this.imagePreview);

      this.loadDistricts(this.issue.state_id);
      this.loadAssemblies(this.issue.district_id);
      this.loadMandals(this.issue.assembly_id);
      this.loadVillages(this.issue.mandal_id);
    }

    this.authService.user$.subscribe((user) => {
      this.loginUser = user;
    });
  }

  // ================= FILE HANDLING =================
  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Only image files allowed');
      this.resetImage();
    }
  }

  resetImage(removeExisting: boolean = false) {
    this.selectedFile = null;
    this.imagePreview = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    if (removeExisting) {
      this.issue.issue_pic = '';
    }
  }

  // ================= MASTER LOAD =================
  loadCategories() {
    this.apiService
      .request(
        'POST',
        '/masterData',
        JSON.stringify({
          master_id: 1,
          mode: 'web',
        }),
      )
      .subscribe((res) => {
        this.categories = res.master_data || [];
      });
  }

  loadStates() {
    this.apiService
      .request(
        'POST',
        '/masterData',
        JSON.stringify({
          master_id: 2,
          mode: 'web',
        }),
      )
      .subscribe((res) => {
        this.states = res.master_data || [];
      });
  }

  loadDistricts(stateId: any) {
    this.loadRepresentatives();

    this.apiService
      .request(
        'POST',
        '/dependanceMasterData',
        JSON.stringify({
          master_id: 3,
          dropdown_id: stateId,
          mode: 'web',
        }),
      )
      .subscribe((res) => {
        this.districts = res.dependance_master_data || [];
      });
  }

  loadAssemblies(districtId: any) {
    this.loadRepresentatives();

    this.apiService
      .request(
        'POST',
        '/dependanceMasterData',
        JSON.stringify({
          master_id: 4,
          dropdown_id: districtId,
          mode: 'web',
        }),
      )
      .subscribe((res) => {
        this.assemblies = res.dependance_master_data || [];
      });
  }

  loadMandals(assemblyId: any) {
    this.loadRepresentatives();

    this.apiService
      .request(
        'POST',
        '/dependanceMasterData',
        JSON.stringify({
          master_id: 5,
          dropdown_id: assemblyId,
          mode: 'web',
        }),
      )
      .subscribe((res) => {
        this.mandals = res.dependance_master_data || [];
      });
  }

  loadVillages(mandalId: any) {
    this.loadRepresentatives();

    this.apiService
      .request(
        'POST',
        '/dependanceMasterData',
        JSON.stringify({
          master_id: 6,
          dropdown_id: mandalId,
          mode: 'web',
        }),
      )
      .subscribe((res) => {
        this.villages = res.dependance_master_data || [];
      });
  }

  loadRepresentatives() {
    this.apiService
      .request(
        'POST',
        '/usersListByLocation',
        JSON.stringify({
          state_id: this.issue.state_id,
          district_id: this.issue.district_id,
          assembly_id: this.issue.assembly_id,
          mandal_id: this.issue.mandal_id,
          village_id: this.issue.village_id,
        }),
      )
      .subscribe((res) => {
        this.representatives = res.usersList || [];
      });
  }

  // ================= SAVE / UPDATE =================
  saveIssue(form: NgForm) {
    if (form.invalid) return;

    const formData = new FormData();

    // ✅ Always append from issue object
    Object.keys(this.issue).forEach((key) => {
      formData.append(key, this.issue[key] ?? '');
    });

    // ✅ Extra fields
    formData.append('id', this.issue.id ?? '');
    formData.append('master_id', '9');
    formData.append('status_id', '1');
    formData.append('comment', 'New issue created');
    formData.append('created_by', this.loginUser?.userId);

    // ✅ Image Handling
    if (this.selectedFile) {
      formData.append('issue_pic', this.selectedFile);
    } else if (this.isEdit && this.issue.issue_pic) {
      formData.append('issue_pic', this.issue.issue_pic);
    }

    // ✅ Debug
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.apiService.request('POST', '/saveAndUpdateIssue', formData).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.router.navigate(['/admin/issues/my-issues'], {
            state: { message: res.message || 'Success' },
          });
        } else {
          this.showMessage(res.message);
        }
      },
      error: () => {
        this.showMessage('Something went wrong');
      },
    });
  }

  // ================= UTIL =================
  handleBackBtn() {
    this.router.navigate(['/admin/issues/my-issues']);
  }

  showMessage(msg: string) {
    this.message = msg;
    this.isMessage = true;

    setTimeout(() => {
      this.isMessage = false;
    }, 3000);
  }
}
