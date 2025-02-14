<template>
  <div id="details-planner" @contextmenu.prevent>
    <h2>상세계획표</h2>
    <div v-if="!spreadsheetReady" class="spinner"></div>
    <div id="details-spreadsheet" v-show="spreadsheetReady" style="display: block; width: 100%;"></div>
    <button @click="hideDetails" class="btn-back">뒤로</button>
    <button @click="addRow" class="btn-add">추가</button>
    <button @click="deleteRow" class="btn-delete">삭제</button>
    <button @click="saveDetails" class="btn-save">저장</button>
  </div>
</template>

<script>
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import spreadsheetMixin from '@/mixins/spreadsheetMixin';
import '../css/myPlanner.css';
import { 
  PLANNER_DETAIL_COL_DATE, PLANNER_DETAIL_COL_DEPARTURE, PLANNER_DETAIL_COL_DESTINATION,
  PLANNER_DETAIL_COL_SCHEDULE, PLANNER_DETAIL_COL_ACCOMMODATION, PLANNER_DETAIL_COL_TRANSPORT_COST,
  PLANNER_DETAIL_COL_LODGING_COST, PLANNER_DETAIL_COL_FOOD_COST, PLANNER_DETAIL_COL_ADMISSION_COST,
  PLANNER_DETAIL_COL_TOTAL_COST, PLANNER_DETAIL_COL_NOTES
} from '@/constants/constants';

export default {
  name: 'MyPlannerDetail',
  props: {
    detailsData: {
      type: Object,
      required: true
    }
  },
  mixins: [spreadsheetMixin],
  data() {
    return {
      detailsSpreadsheetInstance: null,
      spreadsheetReady: false, // Initialize as false
      selectedRow: null // Track selected row in detail view
    };
  },
  mounted() {
    this.initializeDetailsSpreadsheet();
    window.addEventListener('resize', this.adjustSpreadsheetWidth);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.adjustSpreadsheetWidth);
  },
  methods: {
    initializeDetailsSpreadsheet() {
      const el = document.getElementById('details-spreadsheet');
      if (el) {
        if (this.detailsSpreadsheetInstance) {
          this.detailsSpreadsheetInstance.destroy();
        }
        this.spreadsheetReady = false; // Reset before initialization

        this.detailsSpreadsheetInstance = jspreadsheet(el, {
          data: this.detailsData.details, // Show column names if no data
          contextMenu: false, // Disable right-click context menu
          columns: [
            { type: 'calendar', title: '날짜', width: '100px', options: { format: 'YYYY-MM-DD' } },
            { type: 'text', title: '출발지', width: '120px' },
            { type: 'text', title: '목적지', width: '120px' },
            { type: 'text', title: '일정', width: '200px' },
            { type: 'text', title: '숙소', width: '200px' },
            { type: 'number', title: '교통비', width: '80px', mask: '#,##0' },
            { type: 'number', title: '숙박비', width: '80px', mask: '#,##0' },
            { type: 'number', title: '식비', width: '80px', mask: '#,##0' },
            { type: 'number', title: '입장료', width: '80px', mask: '#,##0' },
            { type: 'number', title: '합계', width: '90px', mask: '#,##0' },
            { type: 'text', title: '비고', width: '200px' }
          ],
          nestedHeaders: [
            [
              { title: '', colspan: 5 },
              { title: '소요액', colspan: 5 },
              { title: '', colspan: 1 }
            ]
          ],
          onselection: (instance, x1, y1) => {
            this.selectedRow = y1;
            this.highlightSelectedRow(this.detailsSpreadsheetInstance, y1); // Use mixin's method
          },
          onchange: (instance, cell, x, y) => {
            const data = instance.jexcel.getData();

            // Check if the row has enough data before accessing specific columns
            if (data[y] && data[y].length > instance.options.columns.length) { //  <-- Check data[y] and length
              if (x >= PLANNER_DETAIL_COL_TRANSPORT_COST && x <= PLANNER_DETAIL_COL_ADMISSION_COST) {
                const transport = parseFloat(data[y][PLANNER_DETAIL_COL_TRANSPORT_COST]) || 0;
                const lodging = parseFloat(data[y][PLANNER_DETAIL_COL_LODGING_COST]) || 0;
                const food = parseFloat(data[y][PLANNER_DETAIL_COL_FOOD_COST]) || 0;
                const admission = parseFloat(data[y][PLANNER_DETAIL_COL_ADMISSION_COST]) || 0;
                const total = transport + lodging + food + admission;
                instance.jexcel.setValueFromCoords(PLANNER_DETAIL_COL_TOTAL_COST, y, total);
              }
            } else {
              // Log a warning or handle the case where the row doesn't have enough data
              console.warn(`Row ${y + 1} does not have enough data yet. Skipping total calculation.`);
            }

            instance.jexcel.updateTable();
          },
          onload: () => {
            this.detailsSpreadsheetInstance.options.minDimensions = [this.detailsSpreadsheetInstance.options.columns.length, this.detailsData.details.length || 1];
            this.detailsSpreadsheetInstance.updateSettings(); // Important!

            this.spreadsheetReady = true; // Mark spreadsheet as ready
            this.adjustSpreadsheetWidth(); // Adjust width on load
          }
        });
      }
    },
    adjustSpreadsheetWidth() {
      const el = document.getElementById('details-spreadsheet');
      if (el && this.detailsSpreadsheetInstance) {
        el.style.width = '100%';
        this.detailsSpreadsheetInstance.updateTable();
      }
    },
    addRow() {
      this.addRowMixin(this.detailsSpreadsheetInstance); // Pass spreadsheetData
    },    
    deleteRow() {
      this.deleteRowMixin(this.selectedRow, this.detailsSpreadsheetInstance, this.selectedRow, this.spreadsheetData); // Pass spreadsheetData
    },
    hideDetails() {
      this.$emit('hideDetails');
    },
    // myPlanner_detail.vue
    saveDetails() {
      this.$emit('saving', true); // Tell the parent saving is starting
      const details = this.detailsSpreadsheetInstance.getData();
      this.$emit('saveDetails', details);
    }
  }
};
</script>