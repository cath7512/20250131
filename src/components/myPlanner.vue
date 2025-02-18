<template>
  <div id="travel-planner" v-if="!showDetails">
    <h2>여행 계획표</h2>
    <div v-if="!spreadsheetReady" class="spinner"></div>
    <div id="spreadsheet" v-show="spreadsheetReady" style="display: block;" ref="spreadsheet"></div>
    <button @click="addRow" class="btn-add">추가</button>
    <button @click="deleteRow" class="btn-delete">삭제</button>
    <button @click="saveData" class="btn-save" :disabled="!spreadsheetReady">저장</button>
    <button @click="showDetailsForSelectedRow" class="btn-detail" style="margin-left:15px;">상세일정</button>
  </div>
  <my-planner-detail v-else @hideDetails="hideDetails" @saveDetails="saveDetails" :detailsData="detailsData" />
</template>

<script>
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import { FIREBASE_CONFIG, PLANNER_COL_TITLE, PLANNER_COL_START_DATE, PLANNER_COL_END_DATE } from '@/constants/constants';
import '../css/myPlanner.css';
import MyPlannerDetail from './myPlanner_detail.vue';
import spreadsheetMixin from '@/mixins/spreadsheetMixin';

let app;
if (!getApps().length) {
  app = initializeApp(FIREBASE_CONFIG);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export default {
  name: 'MyPlanner',
  components: {
    MyPlannerDetail
  },
  mixins: [spreadsheetMixin], // Use the mixin
  data() {
    return {
      spreadsheetData: [],
      jspreadsheetInstance: null,
      spreadsheetReady: false, // Initialize as false
      showDetails: false,
      detailsData: {
        rowIndex: null,
        details: []
      },
      selectedRow: null // Track the selected row
    };
  },
  async mounted() {
    await this.loadData();  // Wait for loadData to complete
  },
  methods: {
    async loadData() {
      try {
        const docRef = doc(db, 'travelPlans', 'plans');
        const docSnap = await getDoc(docRef);
        let loadedData = [];
        if (docSnap.exists()) {
          const docData = docSnap.data();
          loadedData = docData && docData.data ? docData.data : [];
        }

        // Ensure there's at least one empty row if no data exists
        if (loadedData.length === 0) {
          loadedData = [{}]; // Add one empty object
        }

        // Restructure the flattened data back into the spreadsheet format
        this.spreadsheetData = loadedData.map(item => ({
          title: item.title || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          details: item.details ? JSON.parse(item.details) : []
        }));
      } catch (error) {
        console.error("Error loading data from Firebase: ", error);
      } finally {
        this.initializeSpreadsheet();
      }
    },
    initializeSpreadsheet() {
      this.spreadsheetReady = false; // Reset to false when initializing
      if (this.jspreadsheetInstance) {
        this.jspreadsheetInstance.destroy();
        this.jspreadsheetInstance = null;
      }
      const spreadsheetEl = document.getElementById('spreadsheet');
      this.jspreadsheetInstance = jspreadsheet(spreadsheetEl, {
        // Enable auto-numbered row headers
        rowHeaders: true,
        data: this.spreadsheetData.map(item => [item.title, item.startDate, item.endDate]),
        columns: [
          { type: 'text', title: '제목', width: '200px' },
          { type: 'calendar', title: '출발일', width: '150px', options: { format: 'YYYY-MM-DD' }, editor: false },
          { type: 'calendar', title: '도착일', width: '150px', options: { format: 'YYYY-MM-DD' }, editor: false }
        ],
        minDimensions: [3, this.spreadsheetData.length], // Set minDimensions based on data length
        contextMenu: false, // Disable right-click context menu
        onselection: (instance, x1, y1) => {  // Remove unused parameters x2, y2
          this.selectedRow = y1;
          this.highlightSelectedRow(this.spreadsheetInstance, y1); // Use the mixin method
        },
        onload: async () => {
          this.spreadsheetReady = true; // Mark spreadsheet as ready
          setTimeout(() => {  //  <- Key change here
            this.addDoubleClickListeners();
          }, 0);       
        },
        onbeforechange: (instance, cell, col, row, val) => {
          if (typeof val === 'number' && !isNaN(val)) {
            return Number(val).toFixed(2);
          }
          return val;
        }
      });
    },
    addDoubleClickListeners() {  // Add this method
      if (!this.jspreadsheetInstance) {
         console.error("jspreadsheetInstance is still null.  Investigate initialization.");
         return; // Don't proceed if it's still null
       }
       
       const table = this.jspreadsheetInstance.el.querySelector('table');

        if (table) {
          table.addEventListener('dblclick', (event) => {
            const cell = event.target.closest('td');
            if (cell) {
              const rowIndex = cell.parentNode.rowIndex -1;
              const columnIndex = cell.cellIndex;

              if (rowIndex >= 0 && columnIndex === PLANNER_COL_TITLE) { // Check for first column (index 0) and not header row
                this.showDetailsForRow(rowIndex);
              }
            }
          });
        } else {
          console.error("Table element not found for double-click listener.");
        }
    },
    showDetailsForRow(row) {
      if (row === null) {
        alert('선택된 행이 없습니다.');
        return;
      }
      // Ensure details exist for this row, create if not
      if (!this.spreadsheetData[row].details) {
        this.spreadsheetData[row].details = [];
      }      
      this.detailsData = {
        rowIndex: row,
        details: JSON.parse(JSON.stringify(this.spreadsheetData[row].details)) // Deep copy to avoid reference issues
      };
      this.showDetails = true;
    },
    showDetailsForSelectedRow() {
      this.showDetailsForRow(this.selectedRow);
    },
    async hideDetails() {
      this.showDetails = false;
      this.spreadsheetReady = false; // Reset to false when hiding details
      this.removeRowHighlight(this.jspreadsheetInstance); // Remove highlight before reloading data
      await this.loadData(); // Reload the travel planner data
    },
    addRow() {
      // Append a row at the bottom
      if (this.jspreadsheetInstance) {
        this.jspreadsheetInstance.insertRow([], this.jspreadsheetInstance.options.data.length);
      }
    },
    deleteRow() {
      if (this.selectedRow === null || this.selectedRow === undefined) {
        alert('삭제할 행이 선택되지 않았습니다.');
        return;
      }
      if (!confirm('정말 삭제하시겠습니까?')) {
        return;
      }
      this.removeRowHighlight(this.jspreadsheetInstance); // Remove the highlight after deleting the row
      // Delete the row from the jspreadsheet instance
      this.jspreadsheetInstance.deleteRow(this.selectedRow);
      // Update the internal data if needed
      this.spreadsheetData.splice(this.selectedRow, 1);
      // Reset the selected row
      this.selectedRow = null;
    },
    async saveData() {
      try {
        if (!this.jspreadsheetInstance) {
          throw new Error('Spreadsheet instance is not initialized.');
        }
        let data = this.jspreadsheetInstance.getData(); // Use getData() directly
        // If all rows are empty, save an empty array to Firebase
        if (data.every(row => row.every(cell => !cell))) {
          data = [];
        }
        // Flatten the data array
        const flattenedData = data.map((row, index) => ({
          title: row[PLANNER_COL_TITLE] || '',
          startDate: row[PLANNER_COL_START_DATE] || '',
          endDate: row[PLANNER_COL_END_DATE] || '',
          details: JSON.stringify(this.spreadsheetData[index]?.details || [])
        }));
        await setDoc(doc(db, 'travelPlans', 'plans'), { data: flattenedData, updatedAt: new Date() });
        alert('저장이 완료되었습니다.'); // Alert after successful save
      } catch (error) {
        alert('저장에 실패했습니다. 다시 시도해주세요.');
        console.error("Error saving data to Firebase: ", error);
      }
    },
    async saveDetails(details) {
      if (this.selectedRow === null) {
        alert('선택된 행이 없습니다.');
        return;
      }
      try {
        // Update the details in spreadsheetData
        this.spreadsheetData[this.detailsData.rowIndex].details = JSON.parse(JSON.stringify(details)); // Deep copy
        await this.saveData(); // Save the main spreadsheet data to Firebase
        // Emit saveDetailsComplete event after successfully saving, optionally pass any required data
        this.$emit('saveDetailsComplete', details);
      } catch (error) {
        console.error("Error saving details: ", error);
        alert('저장에 실패했습니다. 다시 시도해주세요.'); // Alert for save failure
      }
    }
  }
};
</script>