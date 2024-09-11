import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (content, tableData) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(content, 'text/html');

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const processNode = (node, x) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return [{ text: node.textContent, x }];
    }

    let elements = [];
    let currentX = x;

    for (let child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        let font = 'normal';
        if (node.nodeName === 'B' || node.nodeName === 'STRONG') font = 'bold';
        if (node.nodeName === 'I' || node.nodeName === 'EM') font = 'italic';

        doc.setFont('Helvetica', font);
        doc.setFontSize(12);

        const words = child.textContent.split(' ');
        for (let word of words) {
          const wordWidth = doc.getTextWidth(word + ' ');

          // If the word exceeds the available width, move to the next line
          if (currentX + wordWidth > maxWidth) {
            currentX = margin;
            y += 20; // Move down to the next line
          }

          elements.push({
            text: word + ' ',
            x: currentX,
            y,
            font,
            underline: node.nodeName === 'U',
          });

          currentX += wordWidth; // Move the cursor forward for the next word
        }
      } else if (child.nodeName === 'BR') {
        // Handle <br> elements by moving to the next line
        currentX = margin;
        y += 20; // Move down to the next line
      } else if (['P', 'DIV'].includes(child.nodeName)) {
        // Handle <p> and <div> elements as block elements with a line break before
        currentX = margin;
        y += 20; // Move down to the next line
        const childElements = processNode(child, currentX);
        elements = elements.concat(childElements);
        if (childElements.length > 0) {
          const lastElement = childElements[childElements.length - 1];
          currentX = lastElement.x + doc.getTextWidth(lastElement.text);
          y += 20; // Add extra space after block elements
        }
      } else {
        const childElements = processNode(child, currentX);
        elements = elements.concat(childElements);
        if (childElements.length > 0) {
          const lastElement = childElements[childElements.length - 1];
          currentX = lastElement.x + doc.getTextWidth(lastElement.text);
        }
      }
    }

    return elements;
  };

  const elements = processNode(htmlDoc.body, margin);

  elements.forEach(element => {
    doc.setFont('Helvetica', element.font);
    doc.setFontSize(12);
    doc.text(element.text, element.x, element.y);

    if (element.underline) {
      const textWidth = doc.getTextWidth(element.text);
      doc.line(element.x, element.y + 2, element.x + textWidth, element.y + 2);
    }
  });

  const reportName = tableData?.name.replace(/ /g, '_');
  const pdfFileName = `${reportName}.pdf`;

  doc.save(pdfFileName);
};
