import { Component } from '@angular/core';
import { PdfService } from '../services/pdf-service.service'; 

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent {
  formData: any = {
    name: '',
    idNumber: '',
    gender: '',
    department: '',
    title: '',
    salary: ''
  };

  constructor(private pdfService: PdfService) {}

  generatePdf() {
    this.pdfService.generatePdf(this.formData);
  }

  onFileChange(event: any) {
    const uploadedFile = event.target.files[0];
    this.pdfService.parsePdf(uploadedFile);
  }
}
