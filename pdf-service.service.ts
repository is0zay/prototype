import { Injectable } from '@angular/core';
import { PDFDocument, rgb, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFField, StandardFonts } from 'pdf-lib';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { InputField } from '../interfaces/input-field';



@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() {}

  async generatePdf(formData: any, formSchema: any[]) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const form = pdfDoc.getForm();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const textFieldWidth = 200;
    const textFieldHeight = 20;
    const textFieldX = 50;
    const labelY = 750;
    const inputFieldY = 720;

    formSchema.forEach((field, index) => {
      const label = field.label;
      const value = formData[field.name];
      let yOffset = page.getHeight() - 30 * (index + 1);
      const inputFieldYOffset = inputFieldY - index * (textFieldHeight + 25);
      const labelYOffset = labelY - index * (textFieldHeight + 25);

      page.drawText(label, {
        x: 50,
        y: labelYOffset,
        size: 10,
        font,
        color: rgb(0, 0, 0)
      });

      if (field.type === 'text' || field.type === 'email' || field.type === 'date' || field.type === 'number' || field.type === 'range') {
        const textField = form.createTextField(field.name);
        textField.setText(value);
        textField.addToPage(page, {
          x: textFieldX,
          y: inputFieldYOffset,
          width: textFieldWidth,
          height: textFieldHeight,
          textColor: rgb(0, 0, 0),
          backgroundColor: rgb(1, 1, 1),
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
      } else if (field.type === 'checkbox') {
        const checkBox = form.createCheckBox(field.name);
        if (value) {
          checkBox.check();
        }
        checkBox.addToPage(page, {
          x: textFieldX,
          y: inputFieldYOffset - 50,
          width: textFieldWidth,
          height: textFieldHeight + 50,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
      } else if (field.type === 'radio') {
        const radioGroup = form.createRadioGroup(field.name);
        (field.options as string[]).forEach((option: string, optionIndex) => {
          const radioButton = radioGroup.addOptionToPage(option, page, {
            x: textFieldX + (optionIndex * 70),
            y: inputFieldYOffset,
            width: 10,
            height: 10,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
          if (value === option) {
            radioGroup.select(option);
          }
          page.drawText(option, {x: textFieldX + (optionIndex * 70) + 20, y: inputFieldYOffset + 5, size: 8}); // Adjust yOffset for each radio button
        });
      } else if (field.type === 'select') {
        const dropdown = form.createDropdown(field.name);
        dropdown.addOptions(field.options || []);
        dropdown.setOptions(field.options || []);
        dropdown.select(field.options[0]);
        dropdown.addToPage(page, {
          x: textFieldX,
          y: inputFieldYOffset,
          width: textFieldWidth,
          height: 25,
          textColor: rgb(0, 0, 0),
          backgroundColor: rgb(1, 1, 1),
          borderColor: rgb(0, 0, 0),
          borderWidth: 2,
        });
      }
      // Handle other input types as needed
    });

    const pdfBytes = await pdfDoc.save();
    this.downloadPdf(pdfBytes);
  }

  async parsePdf(file: File, formSchema: any[]): Promise<any> {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer);
    const form = pdfDoc.getForm();

    const formData: any = {};

    formSchema.forEach(field => {
      const pdfField = form.getField(field.name);

      if (pdfField instanceof PDFTextField) {
        formData[field.name] = pdfField.getText();
      } else if (pdfField instanceof PDFCheckBox) {
        formData[field.name] = pdfField.isChecked();
      } else if (pdfField instanceof PDFRadioGroup) {
        formData[field.name] = pdfField.getSelected();
      } else if (pdfField instanceof PDFDropdown) {
        formData[field.name] = pdfField.getSelected();
      } else {
        // Handle other field types as needed
        formData[field.name] = ''; // Fallback for unsupported field types
      }
    });
    console.log(formData);
    return formData;
  }

  downloadPdf(pdfBytes: Uint8Array) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'form.pdf';
    link.click();
  }

}

