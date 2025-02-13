// src/mixins/spreadsheetMixin.js
export default {
  methods: {
    addRowMixin(spreadsheetInstance) {
      if (spreadsheetInstance) {
        spreadsheetInstance.insertRow([], spreadsheetInstance.options.data.length);
      }
    },
    deleteRowMixin(selectedRow, spreadsheetInstance, row, spreadsheetData) { // Add spreadsheetData parameter
      if (spreadsheetInstance && row >= 0) {
        if (confirm('정말 삭제하시겠습니까?')) { // Confirmation dialog
          spreadsheetInstance.deleteRow(row);

          // Update the internal data array
          if (spreadsheetData) {
            spreadsheetData.splice(row, 1);
          }
          selectedRow = null;
        }
      }
    },
    highlightSelectedRow(spreadsheetInstance, row) {
      if (spreadsheetInstance) {
        const rows = spreadsheetInstance.el.querySelectorAll('tbody tr');
        rows.forEach((rowElement, index) => {
          if (index === row) {
            rowElement.style.backgroundColor = 'yellow';
          } else {
            rowElement.style.backgroundColor = ''; // Reset other rows
          }
        });
      }
    },
    removeRowHighlight(spreadsheetInstance) {
      if (spreadsheetInstance) {
        const rows = spreadsheetInstance.el.querySelectorAll('tbody tr');
        rows.forEach(rowElement => {
          rowElement.style.backgroundColor = '';
        });
      }
    }
  }
};
