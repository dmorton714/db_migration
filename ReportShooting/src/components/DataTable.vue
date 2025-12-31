<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  pageSize: { type: Number, default: 10 },

  searchable: { type: Boolean, default: true },
  searchField: { type: String, default: '' },



  // NEW — optional: restrict which columns participate
  yearFilterFields: {
    type: Array,
    default: () => []
  }
})

// State
const currentPage = ref(1)
const searchQuery = ref('')

// Sorting
const sortField = ref('')
const sortAsc = ref(true)


/* -------------------------
   Filter + Sort + Paginate
-------------------------- */
const filteredData = computed(() => {
  let result = props.data

  // SEARCH FILTER
  if (props.searchable && searchQuery.value) {
    const q = searchQuery.value.toLowerCase()

    if (props.searchField) {
      result = result.filter(row =>
        String(row[props.searchField] ?? '')
          .toLowerCase()
          .includes(q)
      )
    } else {
      result = result.filter(row =>
        props.columns.some(col =>
          String(row[col.field] ?? '')
            .toLowerCase()
            .includes(q)
        )
      )
    }
  }

  // ⬆ SORT
  if (sortField.value) {
    result = [...result].sort((a, b) => {
      if (a[sortField.value] < b[sortField.value]) return sortAsc.value ? -1 : 1
      if (a[sortField.value] > b[sortField.value]) return sortAsc.value ? 1 : -1
      return 0
    })
  }

  return result
})

// Pagination
const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / props.pageSize)
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return filteredData.value.slice(start, start + props.pageSize)
})

// Methods
function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }

function sortBy(col) {
  if (sortField.value === col.field) {
    sortAsc.value = !sortAsc.value
  } else {
    sortField.value = col.field
    sortAsc.value = true
  }
}

// Reset page when data changes
watch(filteredData, () => currentPage.value = 1)
</script>


<template>
  <div class="data-table">
    <!-- Search -->
    <input
      v-if="props.searchable"
      v-model="searchQuery"
      type="text"
      placeholder="Search…"
      class="search-box"
    />

    <table>
      <thead>
        <tr>
          <th
            v-for="col in props.columns"
            :key="col.field"
            @click="sortBy(col)"
            style="cursor:pointer"
          >
            {{ col.label }}
            <span v-if="sortField === col.field">
              {{ sortAsc ? '▲' : '▼' }}
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="row in paginatedData" :key="row.id || row[columns[0].field]">
          <td v-for="col in columns" :key="col.field">
            {{ row[col.field] }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="currentPage === 1">Prev</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<style scoped>
.data-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-box, .year-filter {
  padding: 0.5rem 0.75rem;
  width: 70%;
  border-radius: 6px;
  border: 1px solid #ccc;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: var(--lou-navy);
  color: white;
  text-align: center;
  padding: 0.5rem;
}

td {
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination button {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--lou-navy);
  background: var(--lou-light);
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
