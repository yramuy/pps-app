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

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: string[] = [];
  issue_images: string[] = [];

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

    if (state.issue) {
      this.issue = state.issue;
      this.isEdit = true;

      if (this.issue.issue_pic) {
        if (Array.isArray(this.issue.issue_pic)) {
          this.existingImages = this.issue.issue_pic;
        } else if (typeof this.issue.issue_pic === 'string') {
          this.existingImages = [this.issue.issue_pic];
        }
      }

      this.loadViewIssueDeta(this.issue.id);

      this.loadDistricts(this.issue.state_id);
      this.loadAssemblies(this.issue.district_id);
      this.loadMandals(this.issue.assembly_id);
      this.loadVillages(this.issue.mandal_id);
    }

    this.authService.user$.subscribe((user: any) => {
      this.loginUser = user;
    });
  }

  loadViewIssueDeta(issueID: any) {
    this.apiService.request('GET', `/issueDataById/${issueID}`).subscribe({
      next: (res: any) => {
        this.issue_images = res.issue_images || [];

        this.existingImages = (res.issue_images || []).map(
          (img: any) => img.img_url,
        );
      },
    });
  }

  onFileChange(event: any) {
    const files: FileList = event.target.files;

    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        alert('Only image files allowed');
        continue;
      }

      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  removeSelectedImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  resetImages(removeExisting: boolean = false) {
    this.selectedFiles = [];
    this.imagePreviews = [];

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    if (removeExisting) {
      this.existingImages = [];
      this.issue.issue_pic = '';
    }
  }

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
      .subscribe((res: { master_data: never[] }) => {
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
      .subscribe((res: { master_data: never[] }) => {
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
      .subscribe((res: { dependance_master_data: never[] }) => {
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
      .subscribe((res: { dependance_master_data: never[] }) => {
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
      .subscribe((res: { dependance_master_data: never[] }) => {
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
      .subscribe((res: { dependance_master_data: never[] }) => {
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
      .subscribe((res: { usersList: never[] }) => {
        this.representatives = res.usersList || [];
      });
  }

  saveIssue(form: NgForm) {
    if (form.invalid) return;

    if (this.selectedFiles.length === 0 && this.existingImages.length === 0) {
      this.showMessage('At least one issue picture is required');
      return;
    }

    const formData = new FormData();

    Object.keys(this.issue).forEach((key) => {
      if (key !== 'issue_pic') {
        formData.append(key, this.issue[key] ?? '');
      }
    });

    formData.append('id', this.issue.id ?? '');
    formData.append('master_id', '9');
    formData.append('status_id', '1');
    formData.append('comment', 'New issue created');
    formData.append('created_by', this.loginUser?.userId);

    // Existing images in edit mode
    this.existingImages.forEach((img) => {
      formData.append('existing_images[]', img);
    });

    // New uploaded images
    this.selectedFiles.forEach((file) => {
      formData.append('images[]', file);
    });

    console.log('FormData values:');
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
