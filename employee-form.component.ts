import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { PdfService } from '../services/pdf-service.service'; 
import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown } from 'pdf-lib';

import { InputField } from '../interfaces/input-field';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  form: FormGroup;
  formSchema: any[] = [];

  constructor(private fb: FormBuilder, private pdfService: PdfService) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    // Define the form schema
    this.formSchema = [
      { type: 'text', label: 'Name', name: 'name' },
      { type: 'text', label: 'ID Number', name: 'idNumber' },
      { type: 'radio', label: 'Gender', name: 'gender', options: ['Male', 'Female', 'Other'] },
      { type: 'select', label: 'Department', name: 'department', options: ['QA', 'DEV', 'ANALYST', 'SCRUM', 'FEATURE'] },
      { type: 'text', label: 'Title', name: 'title' },
      { type: 'number', label: 'Salary', name: 'salary' },
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
