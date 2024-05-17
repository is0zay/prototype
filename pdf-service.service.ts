import { Injectable } from '@angular/core';
import { PDFDocument, rgb, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown } from 'pdf-lib';
import { InputField } from '../interfaces/input-field';


@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() {}

  async generatePdf(inputFields: InputField[], formData: any) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 400]);
    const form = pdfDoc.getForm();

    const textFieldWidth = 200;
    const textFieldHeight = 20;
    const textFieldX = 50;
    const labelY = 350;
    const inputFieldY = 320;

    inputFields.forEach(async (field, index) => {
      const inputFieldYOffset = inputFieldY - index * (textFieldHeight + 25);
      const labelYOffset = labelY - index * (textFieldHeight + 25);

      page.drawText(field.label, { x: textFieldX, y: labelYOffset, size: 10 });

      if (field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'range' || field.type === 'date') {
        const textField = form.createTextField(field.fieldName);
        textField.setText(formData[field.fieldName]?.toString() || '');
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
      } else if (field.type === 'select') {
        const selectField = form.createDropdown(field.fieldName);
        selectField.setOptions(field.options || []);
        selectField.select(formData[field.fieldName] || '');
        selectField.addToPage(page, {
          textColor: rgb(0, 0, 0),
          backgroundColor: rgb(1, 1, 1),
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
          x: textFieldX,
          y: inputFieldYOffset,
          width: textFieldWidth,
          height: textFieldHeight,
        });
      } else if (field.type === 'radio') {
        const radioGroup = form.createRadioGroup(field.fieldName);
        (field.options || []).forEach((option, optionIndex) => {
          radioGroup.addOptionToPage(option, page, {
            x: textFieldX + (optionIndex * 70),
            y: inputFieldYOffset,
            width: 10,
            height: 10,
            textColor: rgb(0, 0, 0),
            backgroundColor: rgb(1, 1, 1),
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
          if (option === formData[field.fieldName]) {
            radioGroup.select(option);
          }
          page.drawText(option, { x: textFieldX + (optionIndex * 70) + 20, y: inputFieldYOffset + 5 });
        });
      } else if (field.type === 'checkbox') {
        const checkboxField = form.createCheckBox(field.fieldName);
        if (formData[field.fieldName]) {
          checkboxField.check();
        } else {
          checkboxField.uncheck();
        }
        checkboxField.addToPage(page, {
          x: textFieldX,
          y: inputFieldYOffset,
          width: textFieldWidth,
          height: textFieldHeight,
        });
      } else if (field.type === 'image') {
        const imageData = formData[field.fieldName];
        if (imageData) {
          const image = await pdfDoc.embedPng(imageData);
          page.drawImage(image, {
            x: textFieldX,
            y: inputFieldYOffset - 50,
            width: textFieldWidth,
            height: textFieldHeight + 50,
          });
        }
      }
    });

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

  async parsePdf(uploadedFile: File): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (!event.target) {
          reject('Error: event.target is null');
          return;
        }
  
        const buffer = event.target.result as ArrayBuffer;
  
        try {
          // Load the PDF file
          const pdfDoc = await PDFDocument.load(new Uint8Array(buffer));
          
          // Extract form field data
          const formData: any = {};
  
          for (const [fieldName, field] of Object.entries(pdfDoc.getForm().getFields())) {
            if (field instanceof PDFTextField) {
              formData[fieldName] = field.getText() || '';
            } else if (field instanceof PDFCheckBox) {
              formData[fieldName] = field.isChecked();
            } else if (field instanceof PDFRadioGroup) {
              const selectedOption = field.getSelected();
              if (selectedOption) {
                formData[fieldName] = selectedOption;
              } else {
                formData[fieldName] = ''; // If no option is selected
              }
            } else {
              formData[fieldName] = ''; // For unsupported field types
            }
          }
  
          resolve(formData);
        } catch (error) {
          reject('Error loading PDF file: ' + error);
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    });
  }
  
}

