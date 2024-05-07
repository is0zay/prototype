import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { PDFDocument, rgb, PDFTextField, PDFCheckBox, PDFRadioGroup } from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  async generatePdf(formData: any) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 400]); // Adding a new page
    const form = pdfDoc.getForm();
  
    const { name, idNumber, gender, department, title, salary } = formData;
  
    // Add text fields
    const textFieldWidth = 200;
    const textFieldHeight = 30;
    const textFieldX = 50; // Example horizontal position
    const labelY = 350; // Example vertical position for labels
    const inputFieldY = 320; // Example vertical position for input fields
  
    const fieldsData = [
      { label: 'Name:', value: name, fieldName: 'name' },
      { label: 'ID Number:', value: idNumber, fieldName: 'idNumber' },
      { label: 'Gender:', value: gender, fieldName: 'gender' },
      { label: 'Department:', value: department, fieldName: 'department' },
      { label: 'Title:', value: title, fieldName: 'title' },
      { label: 'Salary:', value: salary, fieldName: 'salary' },
    ];

    fieldsData.forEach(({ label, value, fieldName }, index) => {
      const inputFieldYOffset = inputFieldY - index * (textFieldHeight + 25);
      const labelYOffset = labelY - index * (textFieldHeight + 25);

      // Add label
      page.drawText(label, { x: textFieldX, y: labelYOffset });

      // Add text field
      const textField = form.createTextField(fieldName);
      textField.setText(value);
      textField.addToPage(page, {
        textColor: rgb(0, 0, 0),
        backgroundColor: rgb(1, 1, 1),
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
        x: textFieldX,
        y: inputFieldYOffset,
        width: textFieldWidth,
        height: textFieldHeight,
      });
    });

  
    // Add other text fields similarly...
  
    // Add a button to save the form
    // const saveButtonWidth = 100;
    // const saveButtonHeight = 30;
    // const saveButtonY = 50;
  
    // page.drawRectangle({
    //   x: 150,
    //   y: saveButtonY,
    //   width: saveButtonWidth,
    //   height: saveButtonHeight,
    //   borderColor: rgb(0, 0, 1),
    //   borderWidth: 1,
    //   color: rgb(0, 0, 1),
    // });
  
    // const buttonText = 'Save';
    // const buttonTextWidth = 50; // Manually specify button text width
    // page.drawText(buttonText, {
    //   x: 150 + (saveButtonWidth - buttonTextWidth) / 2,
    //   y: saveButtonY + (saveButtonHeight - 12) / 2,
    //   size: 12,
    //   color: rgb(1, 1, 1),
    // });

//     const saveButtonField = form.createButton('saveButton');
//     const pageIndex = pdfDoc.getPageIndex(page);

// // Add the button to the page using its index
// saveButtonField.addToPage(pageIndex, {
//   color: rgb(1, 1, 1),
//   backgroundColor: rgb(0, 0, 255),
//   borderColor: rgb(0, 0, 255),
//   borderWidth: 1,
//   x: 150,
//   y: saveButtonY,
//   width: saveButtonWidth,
//   height: saveButtonHeight,
// });


    const pdfBytes = await pdfDoc.save();
    this.downloadPdf(pdfBytes);
  }

  
  downloadPdf(pdfBytes: Uint8Array) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'employee_form.pdf';
    link.click();
  }

  async parsePdf(uploadedFile: File) {
  const reader = new FileReader();
  reader.onload = async (event) => {
    if (!event.target) {
      console.error('Error: event.target is null');
      return;
    }

    const buffer = event.target.result as ArrayBuffer;

    try {
      // Load the PDF file
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer));

      // Extract form field data
      const formData: any = {};

      for (const [fieldName, field] of Object.entries(pdfDoc.getForm().getFields())) {
        // Check the type of the field and get its value accordingly
        if (field instanceof PDFTextField) {
          formData[fieldName] = field.getText() || ''; // For text fields
        } else if (field instanceof PDFCheckBox) {
          formData[fieldName] = field.isChecked(); // For check boxes
        } else if (field instanceof PDFRadioGroup) {
          formData[fieldName] = field.getSelected(); // For radio groups
        } else {
          // Handle other field types as needed
          formData[fieldName] = ''; // For unsupported field types
        }
      }

      console.log(formData);
      // Here you can populate your form fields with formData
    } catch (error) {
      console.error('Error loading PDF file:', error);
    }
  };
  reader.readAsArrayBuffer(uploadedFile);
}

  
  
  
}