<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { Bar, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

// --- STATE MANAGEMENT ---
const route = useRoute();
const router = useRouter();
const historyData = ref([]);
const forecastResponse = ref(null); // To store the entire forecast API response
const isLoading = ref(false);
const isForecasting = ref(false);
const error = ref(null);
const forecastError = ref(null);


const { university, school, degree } = route.params;

// --- COMPUTED PROPERTIES FOR LATEST DATA & CHARTS ---
const latestRecord = computed(() => {
  if (!historyData.value || historyData.value.length === 0) return null;
  // Sort by year descending and take the first element
  return [...historyData.value].sort((a, b) => b.year - a.year)[0];
});

const chartData = computed(() => {
  const sortedData = [...historyData.value].sort((a, b) => a.year - b.year);
  const labels = sortedData.map(item => item.year);
  
  const processDataPoint = (key) => sortedData.map(item => isNaN(parseFloat(item[key])) ? null : parseFloat(item[key]));

  return {
    salaryData: {
      labels,
      datasets: [
        {
          label: 'Gross Monthly Mean',
          backgroundColor: '#0d6efd',
          borderColor: '#0d6efd',
          data: processDataPoint('gross_monthly_mean'),
        },
        {
          label: 'Basic Monthly Mean',
          backgroundColor: '#6c757d',
          borderColor: '#6c757d',
          data: processDataPoint('basic_monthly_mean'),
        }
      ]
    },
    employmentData: {
      labels,
      datasets: [
        {
          label: 'Overall Employment Rate',
          backgroundColor: '#198754',
          data: processDataPoint('employment_rate_overall'),
        },
        {
          label: 'Full-Time Permanent Rate',
          backgroundColor: '#ffc107',
          data: processDataPoint('employment_rate_ft_perm'),
        }
      ]
    }
  };
});

const forecastChartData = computed(() => {
    if (!forecastResponse.value) return null;

    const historical = [...forecastResponse.value.historical_data].sort((a,b) => a.year - b.year);
    const forecast = forecastResponse.value.forecast;
    
    const allLabels = historical.map(h => h.year).concat(forecast.map(f => f.year));
    
    const historicalSalaries = historical.map(h => h.median_salary);
    const modelPredictions = historical.map(h => h.model_prediction);

    // Create an array of nulls for the historical part of the forecast line
    const forecastSalaries = new Array(historical.length - 1).fill(null)
    // Bridge the gap and add forecast data
    forecastSalaries.push(historicalSalaries[historicalSalaries.length-1], ...forecast.map(f => f.predicted_median_salary));

    return {
        labels: allLabels,
        datasets: [
            {
                label: 'Historical Median Salary',
                data: historicalSalaries,
                borderColor: '#0d6efd',
                backgroundColor: '#0d6efd',
                tension: 0.1
            },
            {
                label: "Model's Historical Prediction",
                data: modelPredictions,
                borderColor: '#198754',
                backgroundColor: '#198754',
                tension: 0.1,
            },
            {
                label: 'Predicted Median Salary',
                data: forecastSalaries,
                borderColor: '#dc3545',
                backgroundColor: '#dc3545',
                borderDash: [5, 5], // Dashed line for forecast
                tension: 0.1
            }
        ]
    };
});


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: false
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            if (context.dataset.label.includes('Rate')) {
               label += context.parsed.y + '%';
            } else {
               label += new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(context.parsed.y);
            }
          }
          return label;
        }
      }
    }
  }
};


// --- API CONFIGURATION & CALLS ---
const getApiConfig = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    const msg = 'Authentication token is missing. Please log in again.';
    error.value = msg;
    forecastError.value = msg;
    return null;
  }
  return {
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    headers: { Authorization: `Bearer ${token}` }
  };
};

async function fetchHistory() {
  const config = getApiConfig();
  if (!config) return;
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get(
      `/ges/history/${encodeURIComponent(university)}/${encodeURIComponent(school)}/${encodeURIComponent(degree)}`,
      config
    );
    historyData.value = response.data.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch historical data.';
  } finally {
    isLoading.value = false;
  }
}

async function runForecast() {
  const config = getApiConfig();
  if (!config) return;

  isForecasting.value = true;
  forecastError.value = null;
  // Keep previous forecast data while loading for a smoother experience
  // forecastResponse.value = null; 

  const payload = { university, school, degree };

  try {
    const response = await axios.post('/forecast/run', payload, config);
    forecastResponse.value = response.data;
  } catch (err)
 {
    forecastError.value = err.response?.data?.message || 'Failed to run forecast.';
  } finally {
    isForecasting.value = false;
  }
}

// --- LIFECYCLE HOOKS ---
onMounted(fetchHistory);

// --- HELPER FUNCTIONS ---
const formatCurrency = (value) => {
    if (isNaN(parseFloat(value)) || value === 'na') return 'N/A';
    return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 0 }).format(value);
};

const formatNumber = (value) => {
    if (isNaN(parseFloat(value)) || value === 'na') return 'N/A';
    return new Intl.NumberFormat('en-SG').format(value);
};

const formatInflation = (value) => {
    if (isNaN(parseFloat(value)) || value === 'na') return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
}

const formatPercentage = (value) => {
    if (isNaN(parseFloat(value)) || value === 'na') return 'N/A';
    return `${value}%`;
};

</script>

<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
            <h1 class="display-6 fw-bolder">{{ degree }}</h1>
            <p class="text-muted mb-0">{{ school }}, {{ university }}</p>
        </div>
        <div class="mt-2 mt-md-0">
            <button @click="router.back()" class="btn btn-outline-secondary me-2">Back to GES</button>
            <button @click="runForecast" class="btn btn-primary" :disabled="isForecasting">
                <span v-if="isForecasting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                {{ isForecasting ? 'Running...' : 'Run Forecast' }}
            </button>
        </div>
    </div>

    <div v-if="isLoading" class="text-center p-5">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"></div>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else-if="latestRecord">
      <!-- Latest Data Summary -->
      <div class="card mb-4 bg-light border-0">
        <div class="card-body">
            <h5 class="card-title">Most Recent Data ({{ latestRecord.year }})</h5>
            <div class="row text-center">
                <div class="col-md-3 col-6 mb-3 mb-md-0">
                    <div class="stat-title">Overall Employment</div>
                    <div class="stat-value">{{ formatPercentage(latestRecord.employment_rate_overall) }}</div>
                </div>
                <div class="col-md-3 col-6 mb-3 mb-md-0">
                    <div class="stat-title">Full-Time Perm.</div>
                    <div class="stat-value">{{ formatPercentage(latestRecord.employment_rate_ft_perm) }}</div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="stat-title">Mean Gross Salary</div>
                    <div class="stat-value">{{ formatCurrency(latestRecord.gross_monthly_mean) }}</div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="stat-title">Mean Basic Salary</div>
                    <div class="stat-value">{{ formatCurrency(latestRecord.basic_monthly_mean) }}</div>
                </div>
            </div>
        </div>
      </div>
      
      <!-- Forecast Results Section -->
      <div v-if="isForecasting && !forecastResponse" class="text-center p-5">
          <div class="spinner-border text-success" role="status"></div>
          <p class="mt-2">Generating forecast...</p>
      </div>
      <div v-if="forecastError" class="alert alert-warning">{{ forecastError }}</div>
      <div v-if="forecastResponse">
          <hr class="my-5">
          <h2 class="mb-4 text-center">Forecast & Model Insights</h2>
          
          <!-- Forecast Chart -->
          <div class="card mb-4">
              <div class="card-body">
                  <h5 class="card-title">Salary Trends & Forecast</h5>
                   <div class="chart-container">
                      <Line v-if="forecastChartData" :data="forecastChartData" :options="chartOptions" />
                  </div>
              </div>
          </div>
          
          <div class="row">
              <div class="col-lg-6 mb-4">
                   <!-- Forecast Table -->
                  <div class="card h-100">
                      <div class="card-body">
                          <h5 class="card-title">3-Year Salary Forecast</h5>
                          <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th class="text-end">Predicted Salary</th>
                                        <th class="text-end">Job Vacancies</th>
                                        <th class="text-end">Inflation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in forecastResponse.forecast" :key="item.year">
                                        <td>{{ item.year }}</td>
                                        <td class="text-end fw-bold">{{ formatCurrency(item.predicted_median_salary) }}</td>
                                        <td class="text-end">{{ formatNumber(item.projected_inputs.avg_job_vacancies) }}</td>
                                        <td class="text-end">{{ formatInflation(item.projected_inputs.yoy_inflation_rate) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="col-lg-6 mb-4">
                   <!-- Model Details -->
                  <div class="card h-100">
                      <div class="card-body">
                          <h5 class="card-title">Model Details</h5>
                           <ul class="list-group list-group-flush small">
                              <li class="list-group-item"><strong>Features Used:</strong> {{ forecastResponse.model_details.features.join(', ') }}</li>
                              <li class="list-group-item"><strong>Sentiment Adjustment:</strong> {{ (forecastResponse.model_details.sentiment_adjustment_factor * 100).toFixed(2) }}%</li>
                              <li class="list-group-item">
                                  <strong>Equation:</strong> 
                                  <div class="font-monospace small mt-1">
                                    Salary ≈ {{ forecastResponse.model_details.equation.intercept.toFixed(2) }} <br>
                                    <span v-for="(coeff, name) in forecastResponse.model_details.equation.coefficients" :key="name">
                                      + ({{ coeff.toFixed(2) }} * {{ name }}) <br>
                                    </span>
                                  </div>
                              </li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Historical Economic Data Table -->
          <div class="card mt-4">
              <div class="card-body">
                  <h5 class="card-title">Historical Economic Data & Model Performance</h5>
                  <div class="table-responsive">
                      <table class="table table-striped table-hover table-sm">
                           <thead>
                              <tr>
                                  <th>Year</th>
                                  <th>Actual Salary</th>
                                  <th>Model Prediction</th>
                                  <th>Nat. Median</th>
                                  <th>Unemployment</th>
                                  <th>GDP (S$M)</th>
                                  <th>Job Vacancies</th>
                                  <th>Inflation</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="item in forecastResponse.historical_data" :key="item.year">
                                  <td>{{ item.year }}</td>
                                  <td class="fw-bold">{{ formatCurrency(item.median_salary) }}</td>
                                  <td>{{ formatCurrency(item.model_prediction) }}</td>
                                  <td>{{ formatCurrency(item.national_median) }}</td>
                                  <td>{{ item.unemployment }}%</td>
                                  <td>{{ formatCurrency(item.annual_gdp) }}</td>
                                  <td>{{ formatNumber(item.avg_job_vacancies) }}</td>
                                  <td>{{ formatInflation(item.yoy_inflation_rate) }}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
          <hr class="my-5">
      </div>

      <!-- Historical Charts -->
      <h2 class="mb-4 text-center">Historical Survey Data</h2>
      <div class="row">
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Historical Salary Trends (Mean)</h5>
              <div class="chart-container">
                <Line :data="chartData.salaryData" :options="chartOptions" />
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Historical Employment Rate Trends</h5>
              <div class="chart-container">
                <Bar :data="chartData.employmentData" :options="chartOptions" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
     <div v-else class="text-center text-muted mt-5">
        <p>No historical data found for this degree.</p>
    </div>
  </div>
</template>

<style scoped>
.stat-title {
    font-size: 0.9rem;
    color: #6c757d;
}
.stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #212529;
}
.chart-container {
    height: 350px;
}
</style>

