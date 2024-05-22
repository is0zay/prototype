import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { PdfService } from '../../services/pdf-service.service'; 

@Component({
  selector: 'app-edit-bow-test-plan',
  templateUrl: './edit-bow-test-plan.component.html',
  styleUrls: ['./edit-bow-test-plan.component.css']
})
export class EditBowTestPlanComponent {
  form: FormGroup;
  formSchema: any[] = [];

  constructor(private fb: FormBuilder, private pdfService: PdfService) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    // Define the form schema
    this.formSchema = [
      { type: 'select', label: 'Test Plan Type', name: 'testPlanType', options: ['Custom', 'Standard', 'Automated'], className: '' },
      { type: 'select', label: 'Status', name: 'status', options: ['Not Started', 'In Progress', 'Review Notes', 'Ready for in Charge Review', 'Approved by In Charge', 'Ready for Manager Review', 'Approved by Manager'], className: '' },
      { type: 'text', label: 'Test Plan Name', name: 'testPlanName', charLimit: 150, className: '' },
      // Add more fields as needed
    ];

    // Dynamically create form controls based on the schema
    const formControls: any = {};
    this.formSchema.forEach(field => {
      if (field.type === 'radio' || field.type === 'select') {
        formControls[field.name] = [field.options[0], Validators.required];
      } else {
        formControls[field.name] = ['', Validators.required];
      }
    });

    this.form = this.fb.group(formControls);
  }

  async generatePdf() {
    const formData = this.form.value;
    await this.pdfService.generatePdf(formData, this.formSchema);
  }

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const formData = await this.pdfService.parsePdf(input.files[0], this.formSchema);
      this.form.patchValue(formData);
    }
  }

  onImageChange(event: Event, fieldName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        this.form.controls[fieldName].setValue(reader.result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
