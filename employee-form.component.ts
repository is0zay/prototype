import { Component } from '@angular/core';
import { PdfService } from '../services/pdf-service.service'; 
import { InputField } from '../interfaces/input-field';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent {
  inputFields: InputField[] = [
    { label: 'Name', fieldName: 'name', type: 'text' },
    { label: 'ID Number', fieldName: 'idNumber', type: 'text' },
    { label: 'Gender', fieldName: 'gender', type: 'radio', options: ['Male', 'Female', 'Other'] },
    { label: 'Department', fieldName: 'department', type: 'select', options: ['HR', 'Finance', 'Engineering', 'Sales'] },
    { label: 'Title', fieldName: 'title', type: 'text' },
    { label: 'Salary', fieldName: 'salary', type: 'number' },
    { label: 'Date of Joining', fieldName: 'dateOfJoining', type: 'date' },
    { label: 'Email', fieldName: 'email', type: 'email' },
    { label: 'Age', fieldName: 'age', type: 'number' },
    { label: 'Active Employee', fieldName: 'activeEmployee', type: 'checkbox' }
  ];

  formData: any = {};

  constructor(private pdfService: PdfService) {}

  generatePdf() {
    this.pdfService.generatePdf(this.inputFields, this.formData);
  }

  parsePdf(event: any) {
    const uploadedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target) {
        console.error('Error: event.target is null');
        return;
      }

      const buffer = event.target.result as ArrayBuffer;

      try {
        // Load the PDF file
        const formData = await this.pdfService.parsePdf(uploadedFile);
        this.formData = formData;
      } catch (error) {
        console.error('Error loading PDF file:', error);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  }

  handleImageUpload(event: Event, fieldName: string) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData[fieldName] = e.target?.result;
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  }
}
