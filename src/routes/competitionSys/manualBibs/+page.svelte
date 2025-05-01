<script>
    import { jsPDF } from 'jspdf'; // You'll need to install this: npm install jspdf
  
    let judgeName = '';
    let bibNumbersInput = '';
    let bibNumbers = [];
    let errorMessage = '';
  
    function parseBibNumbers() {
      bibNumbers = bibNumbersInput
        .split(/[\n, ]+/) // Split by newline, comma, or space
        .filter(num => num.trim() !== '')
        .slice(0, 25); // Limit to 25 bib numbers
  
      if (bibNumbers.length > 25) {
        errorMessage = 'You can enter a maximum of 25 bib numbers.';
      } else {
        errorMessage = '';
      }
    }
  
    function generatePDF() {
      if (!judgeName.trim()) {
        errorMessage = 'Please enter the judge\'s name.';
        return;
      }
      if (bibNumbers.length === 0) {
        errorMessage = 'Please enter at least one bib number.';
        return;
      }
  
      generateScoringSheet(judgeName, bibNumbers);
    }
  
    function generateBlankPDF() {
      generateScoringSheet('', Array(25).fill('')); // Pass empty judge name and 25 empty strings
    }
  
    function generateScoringSheet(judge, bibs) {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
  
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const bibColumnWidth = 15;
        const resultColumnWidth = 15;
        const availableWidth = pageWidth - 2 * margin - bibColumnWidth - resultColumnWidth - 10;
        const notesColumnWidth = availableWidth > 0 ? availableWidth : 30;
  
        const numRows = bibs.length + 1;
        const availableHeight = pageHeight - 2 * margin - 20;
        const calculatedRowHeight = availableHeight / numRows;
        const minRowHeight = 7;
        const rowHeight = Math.max(calculatedRowHeight, minRowHeight);
  
        let yPosition = margin + 8;
  
        pdf.setFontSize(14);
        pdf.text(`Scoring Sheet - Judge: ${judge}`, margin, yPosition);
        yPosition += 8;
  
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Bib #', margin, yPosition);
        pdf.text('Notes', margin + bibColumnWidth + 5, yPosition);
        pdf.text('Result', pageWidth - margin - resultColumnWidth, yPosition);
        yPosition += 4;
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 2;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
  
        bibs.forEach(bib => {
          pdf.rect(margin, yPosition, bibColumnWidth, rowHeight);
          pdf.text(bib, margin + 2, yPosition + rowHeight / 2 + 1.5);
          pdf.rect(margin + bibColumnWidth + 5, yPosition, notesColumnWidth, rowHeight);
          pdf.rect(pageWidth - margin - resultColumnWidth, yPosition, resultColumnWidth, rowHeight);
          yPosition += rowHeight;
        });
  
        pdf.save(`scoring_sheet_${judge.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      }
  </script>
  
  <svelte:head>
    <title>Scoring Template Generator</title>
  </svelte:head>
  
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Scoring Template Generator</h1>
  
    <div class="mb-4">
      <label for="judgeName" class="block text-gray-700 text-sm font-bold mb-2">Judge's Name:</label>
      <input type="text" id="judgeName" bind:value={judgeName} placeholder="Enter judge's name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
    </div>
  
    <div class="mb-4">
      <label for="bibNumbers" class="block text-gray-700 text-sm font-bold mb-2">Contestant Bib Numbers (one per line, comma-separated, or space-separated - max 25):</label>
      <textarea id="bibNumbers" bind:value={bibNumbersInput} placeholder="Enter bib numbers here" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"></textarea>
      <button on:click={parseBibNumbers} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2">Parse Bib Numbers</button>
    </div>
  
    {#if bibNumbers.length > 0}
      <p class="mt-2 text-sm text-gray-600">Parsed Bib Numbers: {bibNumbers.join(', ')}</p>
    {/if}
  
    {#if errorMessage}
      <p class="text-red-500 mt-2">{errorMessage}</p>
    {/if}
  
    <div class="flex gap-4 mt-4">
      <button on:click={generatePDF} class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Generate Scoring PDF</button>
      <button on:click={generateBlankPDF} class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Create Blank Sheet</button>
    </div>
  </div>
  