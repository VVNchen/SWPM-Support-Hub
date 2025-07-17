/**
 * Report Functions Module
 * Handles report generation and analytics for firmware tab
 */
class ReportFunctions {
  constructor() {
    this.reportTemplates = [];
    this.reportHistory = [];
    this.chartInstances = {};
    this.initialized = false;
    this.currentReport = null;
  }

  /**
   * Initialize the report module
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Initializing Report module...');

    try {
      await this.loadReportTemplates();
      this.bindEvents();
      this.setupDefaultTemplates();
      this.loadReportData();
      this.initialized = true;
      console.log('Report module initialized successfully');
    } catch (error) {
      console.error('Error initializing Report module:', error);
    }
  }

  /**
   * Load report templates
   */
  async loadReportTemplates() {
    this.reportTemplates = [
      {
        id: 'firmware_summary',
        name: 'Firmware Summary Report',
        description: 'Overview of all firmware versions and their status',
        type: 'summary',
        parameters: ['dateRange', 'products', 'status'],
        charts: ['statusChart', 'productChart', 'timelineChart']
      },
      {
        id: 'test_results',
        name: 'Test Results Report',
        description: 'Detailed testing results and metrics',
        type: 'detailed',
        parameters: ['dateRange', 'testTypes', 'products'],
        charts: ['passRateChart', 'defectChart', 'trendChart']
      },
      {
        id: 'issue_tracking',
        name: 'Issue Tracking Report',
        description: 'Bug reports and issue resolution tracking',
        type: 'tracking',
        parameters: ['dateRange', 'severity', 'assignee'],
        charts: ['severityChart', 'resolutionChart', 'assigneeChart']
      },
      {
        id: 'performance_metrics',
        name: 'Performance Metrics Report',
        description: 'System performance and benchmark data',
        type: 'metrics',
        parameters: ['dateRange', 'metrics', 'products'],
        charts: ['performanceChart', 'benchmarkChart', 'comparisonChart']
      }
    ];
  }

  /**
   * Setup default templates
   */
  setupDefaultTemplates() {
    const templateSelect = document.getElementById('reportTemplate');
    if (templateSelect) {
      templateSelect.innerHTML = '<option value="">Select Report Template...</option>';
      this.reportTemplates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        templateSelect.appendChild(option);
      });
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Template selection
    const templateSelect = document.getElementById('reportTemplate');
    if (templateSelect) {
      templateSelect.addEventListener('change', () => this.onTemplateChange());
    }

    // Generate report button
    const generateBtn = document.getElementById('generateReport');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateReport());
    }

    // Export buttons
    const exportPdfBtn = document.getElementById('exportPdf');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => this.exportReport('pdf'));
    }

    const exportExcelBtn = document.getElementById('exportExcel');
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', () => this.exportReport('excel'));
    }

    const exportCsvBtn = document.getElementById('exportCsv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => this.exportReport('csv'));
    }

    // Schedule report button
    const scheduleBtn = document.getElementById('scheduleReport');
    if (scheduleBtn) {
      scheduleBtn.addEventListener('click', () => this.scheduleReport());
    }

    // Date range picker
    const dateRangeInputs = document.querySelectorAll('.date-range-input');
    dateRangeInputs.forEach(input => {
      input.addEventListener('change', () => this.updatePreview());
    });
  }

  /**
   * Handle template selection change
   */
  onTemplateChange() {
    const templateSelect = document.getElementById('reportTemplate');
    const selectedTemplate = this.reportTemplates.find(t => t.id === templateSelect.value);

    if (selectedTemplate) {
      this.showTemplateParameters(selectedTemplate);
      this.updateTemplateDescription(selectedTemplate);
    } else {
      this.hideTemplateParameters();
    }
  }

  /**
   * Show template parameters form
   */
  showTemplateParameters(template) {
    const container = document.getElementById('reportParameters');
    if (!container) return;

    container.innerHTML = '';
    container.style.display = 'block';

    template.parameters.forEach(param => {
      const paramDiv = this.createParameterInput(param);
      container.appendChild(paramDiv);
    });
  }

  /**
   * Create parameter input based on type
   */
  createParameterInput(paramType) {
    const div = document.createElement('div');
    div.className = 'parameter-group';

    switch (paramType) {
      case 'dateRange':
        div.innerHTML = `
                    <label>Date Range</label>
                    <div class="date-range-inputs">
                        <input type="date" id="startDate" class="date-range-input">
                        <span>to</span>
                        <input type="date" id="endDate" class="date-range-input">
                    </div>
                `;
        break;

      case 'products':
        div.innerHTML = `
                    <label>Products</label>
                    <select id="productFilter" multiple>
                        <option value="all">All Products</option>
                        <option value="router">Router</option>
                        <option value="switch">Switch</option>
                        <option value="firewall">Firewall</option>
                        <option value="wireless">Wireless</option>
                    </select>
                `;
        break;

      case 'status':
        div.innerHTML = `
                    <label>Status Filter</label>
                    <select id="statusFilter" multiple>
                        <option value="all">All Status</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                    </select>
                `;
        break;

      case 'testTypes':
        div.innerHTML = `
                    <label>Test Types</label>
                    <select id="testTypeFilter" multiple>
                        <option value="all">All Tests</option>
                        <option value="functional">Functional</option>
                        <option value="performance">Performance</option>
                        <option value="security">Security</option>
                        <option value="regression">Regression</option>
                    </select>
                `;
        break;

      case 'severity':
        div.innerHTML = `
                    <label>Issue Severity</label>
                    <select id="severityFilter" multiple>
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                `;
        break;

      case 'assignee':
        div.innerHTML = `
                    <label>Assignee</label>
                    <select id="assigneeFilter" multiple>
                        <option value="all">All Assignees</option>
                        <option value="john">John Doe</option>
                        <option value="jane">Jane Smith</option>
                        <option value="mike">Mike Johnson</option>
                        <option value="unassigned">Unassigned</option>
                    </select>
                `;
        break;

      case 'metrics':
        div.innerHTML = `
                    <label>Performance Metrics</label>
                    <select id="metricsFilter" multiple>
                        <option value="all">All Metrics</option>
                        <option value="throughput">Throughput</option>
                        <option value="latency">Latency</option>
                        <option value="memory">Memory Usage</option>
                        <option value="cpu">CPU Usage</option>
                    </select>
                `;
        break;
    }

    return div;
  }

  /**
   * Update template description
   */
  updateTemplateDescription(template) {
    const descElement = document.getElementById('templateDescription');
    if (descElement) {
      descElement.textContent = template.description;
      descElement.style.display = 'block';
    }
  }

  /**
   * Hide template parameters
   */
  hideTemplateParameters() {
    const container = document.getElementById('reportParameters');
    if (container) {
      container.style.display = 'none';
    }

    const descElement = document.getElementById('templateDescription');
    if (descElement) {
      descElement.style.display = 'none';
    }
  }

  /**
   * Generate report based on selected template and parameters
   */
  async generateReport() {
    const templateId = document.getElementById('reportTemplate')?.value;
    if (!templateId) {
      alert('Please select a report template');
      return;
    }

    const template = this.reportTemplates.find(t => t.id === templateId);
    if (!template) return;

    try {
      // Show loading state
      this.showReportLoading(true);

      // Collect parameters
      const parameters = this.collectParameters(template);

      // Generate report data
      const reportData = await this.generateReportData(template, parameters);

      // Create report instance
      this.currentReport = {
        id: Date.now(),
        templateId: templateId,
        templateName: template.name,
        parameters: parameters,
        data: reportData,
        generatedAt: new Date(),
        charts: template.charts
      };

      // Display report
      this.displayReport(this.currentReport);

      // Add to history
      this.reportHistory.unshift(this.currentReport);
      this.updateReportHistory();

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report: ' + error.message);
    } finally {
      this.showReportLoading(false);
    }
  }

  /**
   * Collect parameters from form
   */
  collectParameters(template) {
    const parameters = {};

    template.parameters.forEach(param => {
      switch (param) {
        case 'dateRange':
          parameters.startDate = document.getElementById('startDate')?.value;
          parameters.endDate = document.getElementById('endDate')?.value;
          break;
        case 'products':
          parameters.products = this.getSelectedValues('productFilter');
          break;
        case 'status':
          parameters.status = this.getSelectedValues('statusFilter');
          break;
        case 'testTypes':
          parameters.testTypes = this.getSelectedValues('testTypeFilter');
          break;
        case 'severity':
          parameters.severity = this.getSelectedValues('severityFilter');
          break;
        case 'assignee':
          parameters.assignee = this.getSelectedValues('assigneeFilter');
          break;
        case 'metrics':
          parameters.metrics = this.getSelectedValues('metricsFilter');
          break;
      }
    });

    return parameters;
  }

  /**
   * Get selected values from multi-select
   */
  getSelectedValues(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return [];

    return Array.from(select.selectedOptions).map(option => option.value);
  }

  /**
   * Generate report data based on template and parameters
   */
  async generateReportData(template, parameters) {
    // Simulate data generation with delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    switch (template.id) {
      case 'firmware_summary':
        return this.generateFirmwareSummaryData(parameters);
      case 'test_results':
        return this.generateTestResultsData(parameters);
      case 'issue_tracking':
        return this.generateIssueTrackingData(parameters);
      case 'performance_metrics':
        return this.generatePerformanceMetricsData(parameters);
      default:
        throw new Error('Unknown template type');
    }
  }

  /**
   * Generate firmware summary report data
   */
  generateFirmwareSummaryData(parameters) {
    return {
      summary: {
        totalFirmwares: 45,
        activeProducts: 12,
        pendingReleases: 3,
        criticalIssues: 2
      },
      statusDistribution: {
        passed: 35,
        failed: 7,
        pending: 3
      },
      productBreakdown: {
        router: 15,
        switch: 12,
        firewall: 10,
        wireless: 8
      },
      timeline: this.generateTimelineData(30),
      details: this.generateFirmwareDetails(parameters)
    };
  }

  /**
   * Generate test results report data
   */
  generateTestResultsData(parameters) {
    return {
      summary: {
        totalTests: 1250,
        passRate: 94.2,
        totalDefects: 23,
        avgExecutionTime: 45
      },
      passRateByType: {
        functional: 96.5,
        performance: 92.1,
        security: 98.2,
        regression: 89.7
      },
      defectsByProduct: {
        router: 8,
        switch: 6,
        firewall: 5,
        wireless: 4
      },
      trendData: this.generateTrendData(30),
      testDetails: this.generateTestDetails(parameters)
    };
  }

  /**
   * Generate issue tracking report data
   */
  generateIssueTrackingData(parameters) {
    return {
      summary: {
        totalIssues: 89,
        openIssues: 34,
        resolvedIssues: 55,
        avgResolutionTime: 3.2
      },
      severityBreakdown: {
        critical: 5,
        high: 12,
        medium: 28,
        low: 44
      },
      resolutionRate: {
        thisWeek: 85,
        lastWeek: 78,
        thisMonth: 82
      },
      assigneeWorkload: {
        john: 12,
        jane: 15,
        mike: 7,
        unassigned: 0
      },
      issueDetails: this.generateIssueDetails(parameters)
    };
  }

  /**
   * Generate performance metrics report data
   */
  generatePerformanceMetricsData(parameters) {
    return {
      summary: {
        avgThroughput: 1250,
        avgLatency: 2.3,
        peakMemoryUsage: 78,
        avgCpuUsage: 45
      },
      benchmarkResults: {
        current: { throughput: 1250, latency: 2.3 },
        baseline: { throughput: 1100, latency: 2.8 },
        improvement: { throughput: 13.6, latency: -17.9 }
      },
      metricsTrend: this.generateMetricsTrend(30),
      performanceDetails: this.generatePerformanceDetails(parameters)
    };
  }

  /**
   * Generate timeline data
   */
  generateTimelineData(days) {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        passed: Math.floor(Math.random() * 10) + 5,
        failed: Math.floor(Math.random() * 3),
        pending: Math.floor(Math.random() * 2)
      });
    }

    return data;
  }

  /**
   * Generate trend data
   */
  generateTrendData(days) {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        passRate: 85 + Math.random() * 15,
        defects: Math.floor(Math.random() * 5),
        tests: Math.floor(Math.random() * 50) + 20
      });
    }

    return data;
  }

  /**
   * Generate metrics trend data
   */
  generateMetricsTrend(days) {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        throughput: 1000 + Math.random() * 500,
        latency: 1.5 + Math.random() * 2,
        memory: 50 + Math.random() * 30,
        cpu: 30 + Math.random() * 40
      });
    }

    return data;
  }

  /**
   * Generate detailed data arrays
   */
  generateFirmwareDetails(parameters) {
    const details = [];
    const products = ['Router-A1', 'Switch-B2', 'Firewall-C3', 'Wireless-D4'];

    for (let i = 0; i < 20; i++) {
      details.push({
        id: `FW${1000 + i}`,
        product: products[Math.floor(Math.random() * products.length)],
        version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`,
        status: ['Passed', 'Failed', 'Pending'][Math.floor(Math.random() * 3)],
        releaseDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        issues: Math.floor(Math.random() * 5)
      });
    }

    return details;
  }

  /**
   * Generate test details
   */
  generateTestDetails(parameters) {
    const details = [];
    const testTypes = ['Functional', 'Performance', 'Security', 'Regression'];

    for (let i = 0; i < 50; i++) {
      details.push({
        id: `T${2000 + i}`,
        name: `Test Case ${i + 1}`,
        type: testTypes[Math.floor(Math.random() * testTypes.length)],
        status: Math.random() > 0.1 ? 'Passed' : 'Failed',
        duration: Math.floor(Math.random() * 300) + 30,
        lastRun: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    return details;
  }

  /**
   * Generate issue details
   */
  generateIssueDetails(parameters) {
    const details = [];
    const severities = ['Critical', 'High', 'Medium', 'Low'];
    const assignees = ['John Doe', 'Jane Smith', 'Mike Johnson'];

    for (let i = 0; i < 30; i++) {
      details.push({
        id: `BUG${3000 + i}`,
        title: `Issue ${i + 1}: Sample bug description`,
        severity: severities[Math.floor(Math.random() * severities.length)],
        status: Math.random() > 0.4 ? 'Resolved' : 'Open',
        assignee: assignees[Math.floor(Math.random() * assignees.length)],
        created: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        resolution: Math.random() > 0.4 ? Math.floor(Math.random() * 10) + 1 : null
      });
    }

    return details;
  }

  /**
   * Generate performance details
   */
  generatePerformanceDetails(parameters) {
    const details = [];
    const products = ['Router-A1', 'Switch-B2', 'Firewall-C3', 'Wireless-D4'];

    for (let i = 0; i < 15; i++) {
      details.push({
        id: `PERF${4000 + i}`,
        product: products[Math.floor(Math.random() * products.length)],
        throughput: Math.floor(Math.random() * 1000) + 500,
        latency: (Math.random() * 5 + 1).toFixed(2),
        memory: Math.floor(Math.random() * 50) + 30,
        cpu: Math.floor(Math.random() * 60) + 20,
        testDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    return details;
  }

  /**
   * Display generated report
   */
  displayReport(report) {
    const container = document.getElementById('reportContent');
    if (!container) return;

    container.innerHTML = `
            <div class="report-header">
                <h2>${report.templateName}</h2>
                <div class="report-meta">
                    <span>Generated: ${report.generatedAt.toLocaleString()}</span>
                    <span>Report ID: ${report.id}</span>
                </div>
            </div>
            
            <div class="report-summary">
                ${this.generateSummarySection(report)}
            </div>
            
            <div class="report-charts">
                ${this.generateChartsSection(report)}
            </div>
            
            <div class="report-details">
                ${this.generateDetailsSection(report)}
            </div>
        `;

    // Initialize charts after DOM is updated
    setTimeout(() => this.initializeCharts(report), 100);
  }

  /**
   * Generate summary section HTML
   */
  generateSummarySection(report) {
    const summary = report.data.summary;
    if (!summary) return '';

    const summaryItems = Object.entries(summary).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return `
                <div class="summary-item">
                    <div class="summary-value">${value}</div>
                    <div class="summary-label">${label}</div>
                </div>
            `;
    }).join('');

    return `
            <h3>Summary</h3>
            <div class="summary-grid">
                ${summaryItems}
            </div>
        `;
  }

  /**
   * Generate charts section HTML
   */
  generateChartsSection(report) {
    if (!report.charts || report.charts.length === 0) return '';

    const chartDivs = report.charts.map(chartId =>
      `<div class="chart-container">
                <canvas id="${chartId}-${report.id}" class="report-chart"></canvas>
            </div>`
    ).join('');

    return `
            <h3>Charts</h3>
            <div class="charts-grid">
                ${chartDivs}
            </div>
        `;
  }

  /**
   * Generate details section HTML
   */
  generateDetailsSection(report) {
    // Generate table based on report type
    const details = report.data.details || report.data.testDetails ||
      report.data.issueDetails || report.data.performanceDetails;

    if (!details || details.length === 0) return '';

    const headers = Object.keys(details[0]);
    const headerRow = headers.map(header =>
      `<th>${header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>`
    ).join('');

    const dataRows = details.slice(0, 10).map(item => // Show first 10 items
      `<tr>${headers.map(header => `<td>${item[header] || 'N/A'}</td>`).join('')}</tr>`
    ).join('');

    return `
            <h3>Details</h3>
            <div class="table-container">
                <table class="report-table">
                    <thead>
                        <tr>${headerRow}</tr>
                    </thead>
                    <tbody>
                        ${dataRows}
                    </tbody>
                </table>
            </div>
        `;
  }

  /**
   * Initialize charts (placeholder - would use actual charting library)
   */
  initializeCharts(report) {
    // This is a placeholder for chart initialization
    // In a real implementation, you would use Chart.js, D3.js, or another charting library

    report.charts.forEach(chartId => {
      const canvas = document.getElementById(`${chartId}-${report.id}`);
      if (canvas) {
        const ctx = canvas.getContext('2d');

        // Draw a simple placeholder chart
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${chartId} Chart`, canvas.width / 2, canvas.height / 2);

        console.log(`Chart ${chartId} initialized for report ${report.id}`);
      }
    });
  }

  /**
   * Show/hide report loading state
   */
  showReportLoading(show) {
    const loadingElement = document.getElementById('reportLoading');
    const contentElement = document.getElementById('reportContent');

    if (loadingElement) {
      loadingElement.style.display = show ? 'block' : 'none';
    }

    if (contentElement && !show) {
      contentElement.style.display = 'block';
    }
  }

  /**
   * Export report in specified format
   */
  async exportReport(format) {
    if (!this.currentReport) {
      alert('Please generate a report first');
      return;
    }

    try {
      switch (format) {
        case 'pdf':
          await this.exportToPdf();
          break;
        case 'excel':
          await this.exportToExcel();
          break;
        case 'csv':
          await this.exportToCsv();
          break;
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      alert(`Failed to export report as ${format.toUpperCase()}`);
    }
  }

  /**
   * Export to PDF (placeholder)
   */
  async exportToPdf() {
    // Placeholder for PDF export
    // In real implementation, would use jsPDF or similar library
    console.log('Exporting to PDF...');

    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1000));

    alert('PDF export completed! (This is a simulation)');
  }

  /**
   * Export to Excel (placeholder)
   */
  async exportToExcel() {
    // Placeholder for Excel export
    // In real implementation, would use SheetJS or similar library
    console.log('Exporting to Excel...');

    await new Promise(resolve => setTimeout(resolve, 1000));

    alert('Excel export completed! (This is a simulation)');
  }

  /**
   * Export to CSV
   */
  async exportToCsv() {
    console.log('Exporting to CSV...');

    const report = this.currentReport;
    const details = report.data.details || report.data.testDetails ||
      report.data.issueDetails || report.data.performanceDetails;

    if (!details || details.length === 0) {
      alert('No data available for CSV export');
      return;
    }

    // Convert to CSV
    const headers = Object.keys(details[0]);
    const csvContent = [
      headers.join(','),
      ...details.map(item =>
        headers.map(header =>
          typeof item[header] === 'string' && item[header].includes(',')
            ? `"${item[header]}"`
            : item[header]
        ).join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.templateName.replace(/\s+/g, '_')}_${report.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    alert('CSV export completed!');
  }

  /**
   * Schedule report generation
   */
  scheduleReport() {
    if (!this.currentReport) {
      alert('Please generate a report first to use as a template');
      return;
    }

    // In real implementation, this would show a scheduling dialog
    const frequency = prompt('Schedule frequency (daily/weekly/monthly):');
    const email = prompt('Email address for delivery:');

    if (frequency && email) {
      alert(`Report scheduled ${frequency} and will be sent to ${email}`);
      console.log('Report scheduled:', { frequency, email, template: this.currentReport.templateId });
    }
  }

  /**
   * Update preview based on current parameters
   */
  updatePreview() {
    // Placeholder for live preview updates
    console.log('Updating report preview...');
  }

  /**
   * Load report data (placeholder)
   */
  loadReportData() {
    // Load historical data, configurations, etc.
    console.log('Loading report data...');
  }

  /**
   * Update report history display
   */
  updateReportHistory() {
    const container = document.getElementById('reportHistory');
    if (!container) return;

    container.innerHTML = '';

    this.reportHistory.slice(0, 10).forEach(report => {
      const historyItem = document.createElement('div');
      historyItem.className = 'report-history-item';
      historyItem.innerHTML = `
                <div class="history-header">
                    <span class="history-name">${report.templateName}</span>
                    <span class="history-date">${report.generatedAt.toLocaleDateString()}</span>
                </div>
                <div class="history-actions">
                    <button onclick="window.reportFunctions.viewReport(${report.id})">View</button>
                    <button onclick="window.reportFunctions.deleteReport(${report.id})">Delete</button>
                </div>
            `;
      container.appendChild(historyItem);
    });
  }

  /**
   * View historical report
   */
  viewReport(reportId) {
    const report = this.reportHistory.find(r => r.id === reportId);
    if (report) {
      this.currentReport = report;
      this.displayReport(report);
    }
  }

  /**
   * Delete historical report
   */
  deleteReport(reportId) {
    if (confirm('Are you sure you want to delete this report?')) {
      this.reportHistory = this.reportHistory.filter(r => r.id !== reportId);
      this.updateReportHistory();
    }
  }

  /**
   * Get module statistics
   */
  getStats() {
    return {
      templates: this.reportTemplates.length,
      generatedReports: this.reportHistory.length,
      currentReport: !!this.currentReport,
      initialized: this.initialized
    };
  }
}

// Create global instance
window.reportFunctions = new ReportFunctions();
