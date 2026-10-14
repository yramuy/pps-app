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
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  selectedVideo: File | null = null;
  videoPreview = '';
  existingVideoUrl = '';
  existingVideoName = '';
  removeExistingVideoFlag = false;

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
    post_date: '',
    // priority: '',
  };

  isEdit: boolean = false;

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: string[] = [];
  issue_images: string[] = [];
  isSaving: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadStates();
    this.loadCategories();

    // Default current date for a new issue
    this.issue.post_date = this.getCurrentDate();

    const state: any = history.state;

    if (state?.issue) {
      this.isEdit = true;

      // Copy the issue instead of keeping the original object reference.
      this.issue = {
        ...this.issue,
        ...state.issue,
      };

      // Keep the existing post date in edit mode
      this.issue.post_date = state.issue.post_date || this.getCurrentDate();

      // this.issue.priority = state.issue.priority ?? '';

      this.issue.state_id = this.toId(this.issue.state_id);
      this.issue.district_id = this.toId(this.issue.district_id);
      this.issue.assembly_id = this.toId(this.issue.assembly_id);
      this.issue.mandal_id = this.toId(this.issue.mandal_id);
      this.issue.village_id = this.toId(this.issue.village_id);
      this.issue.assigned_to = this.toId(this.issue.assigned_to);

      if (Array.isArray(this.issue.issue_pic)) {
        this.existingImages = [...this.issue.issue_pic];
      } else if (
        typeof this.issue.issue_pic === 'string' &&
        this.issue.issue_pic
      ) {
        this.existingImages = [this.issue.issue_pic];
      }

      this.loadViewIssueDeta(this.issue.id);
      this.loadEditLocationData();
    }

    this.authService.user$.subscribe((user: any) => {
      this.loginUser = user;
    });
  }

  private getCurrentDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private toId(value: any): string {
    return value === null || value === undefined ? '' : String(value);
  }

  loadEditLocationData(): void {
    const stateId = this.toId(this.issue.state_id);
    const districtId = this.toId(this.issue.district_id);
    const assemblyId = this.toId(this.issue.assembly_id);
    const mandalId = this.toId(this.issue.mandal_id);
    const villageId = this.toId(this.issue.village_id);
    const assignedTo = this.toId(this.issue.assigned_to);

    const loadDependentData = (
      masterId: number,
      parentId: string,
      callback: (items: any[]) => void,
    ): void => {
      if (!parentId) {
        callback([]);
        return;
      }

      this.apiService
        .request(
          'POST',
          '/dependanceMasterData',
          JSON.stringify({
            master_id: masterId,
            dropdown_id: parentId,
            mode: 'web',
          }),
        )
        .subscribe({
          next: (res: any) => {
            callback(
              (res.dependance_master_data || []).map((item: any) => ({
                ...item,
                id: this.toId(item.id),
              })),
            );
          },
          error: (err: any) => {
            console.error(`Failed to load master ${masterId}:`, err);
            callback([]);
          },
        });
    };

    this.issue.state_id = stateId;

    loadDependentData(3, stateId, (districts) => {
      this.districts = districts;
      this.issue.district_id = districtId;

      loadDependentData(4, districtId, (assemblies) => {
        this.assemblies = assemblies;
        this.issue.assembly_id = assemblyId;

        loadDependentData(5, assemblyId, (mandals) => {
          this.mandals = mandals;
          this.issue.mandal_id = mandalId;

          loadDependentData(6, mandalId, (villages) => {
            this.villages = villages;
            this.issue.village_id = villageId;
            this.issue.assigned_to = assignedTo;

            // Load representatives after the location is restored.
            this.loadRepresentatives();
          });
        });
      });
    });
  }

  loadDistricts(stateId: any): void {
    this.issue.state_id = this.toId(stateId);
    this.issue.district_id = '';
    this.issue.assembly_id = '';
    this.issue.mandal_id = '';
    this.issue.village_id = '';

    this.districts = [];
    this.assemblies = [];
    this.mandals = [];
    this.villages = [];
    this.representatives = [];

    if (!stateId) return;

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
      .subscribe({
        next: (res: any) => {
          this.districts = (res.dependance_master_data || []).map(
            (item: any) => ({ ...item, id: this.toId(item.id) }),
          );
        },
        error: (err: any) => console.error('District loading failed:', err),
      });
  }

  loadAssemblies(districtId: any): void {
    this.issue.district_id = this.toId(districtId);
    this.issue.assembly_id = '';
    this.issue.mandal_id = '';
    this.issue.village_id = '';

    this.assemblies = [];
    this.mandals = [];
    this.villages = [];
    this.representatives = [];

    if (!districtId) return;

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
      .subscribe({
        next: (res: any) => {
          this.assemblies = (res.dependance_master_data || []).map(
            (item: any) => ({ ...item, id: this.toId(item.id) }),
          );

          this.loadRepresentatives();
        },

        
        
        error: (err: any) => console.error('Assembly loading failed:', err),
      });
  }

  loadMandals(assemblyId: any): void {
    this.issue.assembly_id = this.toId(assemblyId);
    this.issue.mandal_id = '';
    this.issue.village_id = '';

    this.mandals = [];
    this.villages = [];
    this.representatives = [];

    if (!assemblyId) return;

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
      .subscribe({
        next: (res: any) => {
          this.mandals = (res.dependance_master_data || []).map(
            (item: any) => ({ ...item, id: this.toId(item.id) }),
          );

          this.loadRepresentatives();
        },
        error: (err: any) => console.error('Mandal loading failed:', err),
      });
  }

  loadVillages(mandalId: any): void {
    this.issue.mandal_id = this.toId(mandalId);
    this.issue.village_id = '';

    this.villages = [];
    this.representatives = [];

    if (!mandalId) return;

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
      .subscribe({
        next: (res: any) => {
          this.villages = (res.dependance_master_data || []).map(
            (item: any) => ({ ...item, id: this.toId(item.id) }),
          );
        },
        error: (err: any) => console.error('Village loading failed:', err),
      });
  }

  // loadRepresentatives(): void {
  //   this.apiService.request(
  //     'POST',
  //     '/usersListByLocation',
  //     JSON.stringify({
  //       state_id: this.issue.state_id,
  //       district_id: this.issue.district_id,
  //       assembly_id: this.issue.assembly_id,
  //       mandal_id: this.issue.mandal_id,
  //       village_id: this.issue.village_id
  //     })
  //   ).subscribe({
  //     next: (res: any) => {
  //       this.representatives = (res.usersList || []).map(
  //         (item: any) => ({ ...item, id: this.toId(item.id) })
  //       );
  //     },
  //     error: (err: any) => console.error('Representative loading failed:', err)
  //   });
  // }

  onVideoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('video/')) {
      this.showMessage('Please select a valid video file.');
      input.value = '';
      return;
    }

    const maxSize = 50 * 1024 * 1024;

    if (file.size > maxSize) {
      this.showMessage('Video size must not exceed 50 MB.');
      input.value = '';
      return;
    }

    // Release the previous preview
    if (this.videoPreview) {
      URL.revokeObjectURL(this.videoPreview);
    }

    this.selectedVideo = file;
    this.videoPreview = URL.createObjectURL(file);

    // A newly selected video replaces the existing video
    this.removeExistingVideoFlag = false;

    // Allow selecting the same file again
    input.value = '';
  }

  removeSelectedVideo(): void {
    if (this.videoPreview) {
      URL.revokeObjectURL(this.videoPreview);
    }

    this.selectedVideo = null;
    this.videoPreview = '';

    if (this.videoInput) {
      this.videoInput.nativeElement.value = '';
    }
  }

  removeExistingVideo(): void {
    this.existingVideoUrl = '';
    this.existingVideoName = '';
    this.removeExistingVideoFlag = true;
  }

  loadViewIssueDeta(issueID: any): void {
    const payload = {
      is_token: '1',
      issue_id: issueID,
    };

    this.apiService.request('POST', '/issueDataById', payload).subscribe({
      next: (res: any) => {
        const issueData = res.issueData || {};

        // Preserve form values while filling missing detail fields.
        this.issue = {
          ...this.issue,
          ...issueData,
        };

        // Normalize dropdown IDs.
        this.issue.state_id = this.toId(this.issue.state_id);
        this.issue.district_id = this.toId(this.issue.district_id);
        this.issue.assembly_id = this.toId(this.issue.assembly_id);
        this.issue.mandal_id = this.toId(this.issue.mandal_id);
        this.issue.village_id = this.toId(this.issue.village_id);
        this.issue.assigned_to = this.toId(this.issue.assigned_to);

        this.existingVideoName = issueData.video || '';
        this.existingVideoUrl = issueData.video_url || '';
        this.removeExistingVideoFlag = false;

        this.issue_images = res.issue_images || [];
        this.existingImages = this.issue_images.map((img: any) => img.img_url);

        // Load options only after the complete issue data is available.
        this.loadEditLocationData();
      },
      error: (err: any) => {
        console.error('Failed to load issue details:', err);
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

  // loadDistricts(stateId: any) {
  //   this.loadRepresentatives();

  //   this.apiService
  //     .request(
  //       'POST',
  //       '/dependanceMasterData',
  //       JSON.stringify({
  //         master_id: 3,
  //         dropdown_id: stateId,
  //         mode: 'web',
  //       }),
  //     )
  //     .subscribe((res: { dependance_master_data: never[] }) => {
  //       this.districts = res.dependance_master_data || [];
  //     });
  // }

  // loadAssemblies(districtId: any) {
  //   this.loadRepresentatives();

  //   this.apiService
  //     .request(
  //       'POST',
  //       '/dependanceMasterData',
  //       JSON.stringify({
  //         master_id: 4,
  //         dropdown_id: districtId,
  //         mode: 'web',
  //       }),
  //     )
  //     .subscribe((res: { dependance_master_data: never[] }) => {
  //       this.assemblies = res.dependance_master_data || [];
  //     });
  // }

  // loadMandals(assemblyId: any) {
  //   this.loadRepresentatives();

  //   this.apiService
  //     .request(
  //       'POST',
  //       '/dependanceMasterData',
  //       JSON.stringify({
  //         master_id: 5,
  //         dropdown_id: assemblyId,
  //         mode: 'web',
  //       }),
  //     )
  //     .subscribe((res: { dependance_master_data: never[] }) => {
  //       this.mandals = res.dependance_master_data || [];
  //     });
  // }

  // loadVillages(mandalId: any) {
  //   this.loadRepresentatives();

  //   this.apiService
  //     .request(
  //       'POST',
  //       '/dependanceMasterData',
  //       JSON.stringify({
  //         master_id: 6,
  //         dropdown_id: mandalId,
  //         mode: 'web',
  //       }),
  //     )
  //     .subscribe((res: { dependance_master_data: never[] }) => {
  //       this.villages = res.dependance_master_data || [];
  //     });
  // }

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
    if (form.invalid) {
      return;
    }

    if (this.selectedFiles.length === 0 && this.existingImages.length === 0) {
      this.showMessage('At least one issue picture is required');
      return;
    }

    // Prevent multiple submissions
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

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
    formData.append('created_by', this.loginUser?.userId ?? '');

    // Existing images
    this.existingImages.forEach((img) => {
      formData.append('existing_images[]', img);
    });

    // Newly selected images
    this.selectedFiles.forEach((file) => {
      formData.append('images[]', file);
    });

    // Newly selected video file
    if (this.selectedVideo) {
      formData.append('video', this.selectedVideo);
    }

    // Existing video removal flag
    formData.append(
      'remove_existing_video',
      this.removeExistingVideoFlag ? '1' : '0',
    );

    console.log('FormData values:');

    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.apiService.request('POST', '/saveAndUpdateIssue', formData).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.router.navigate(['/admin/issues/my-issues'], {
            state: {
              message: res.message || 'Success',
            },
          });
        } else {
          this.isSaving = false;
          this.showMessage(res.message || 'Unable to save issue');
        }
      },

      error: (err) => {
        console.error('Save issue error:', err);

        this.isSaving = false;
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
