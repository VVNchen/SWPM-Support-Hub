/**
 * Sync Functions Module
 * Handles synchronization functionality for firmware tab
 */
class SyncFunctions {
  constructor() {
    this.syncSources = [];
    this.syncHistory = [];
    this.activeSync = null;
    this.initialized = false;
    this.syncInterval = null;
  }

  /**
   * Initialize the sync module
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Initializing Sync module...');

    try {
      await this.loadSyncSources();
      this.bindEvents();
      this.setupDefaultSources();
      this.loadSyncHistory();
      this.initialized = true;
      console.log('Sync module initialized successfully');
    } catch (error) {
      console.error('Error initializing Sync module:', error);
    }
  }

  /**
   * Load sync sources from configuration
   */
  async loadSyncSources() {
    try {
      // Default sync sources
      this.syncSources = [
        {
          id: 'redmine_server',
          name: 'Redmine Server',
          type: 'redmine',
          url: 'https://redmine.example.com',
          enabled: true,
          lastSync: null,
          status: 'disconnected'
        },
        {
          id: 'plm_system',
          name: 'PLM System',
          type: 'plm',
          url: 'https://plm.example.com',
          enabled: true,
          lastSync: null,
          status: 'disconnected'
        },
        {
          id: 'jira_server',
          name: 'JIRA Server',
          type: 'jira',
          url: 'https://jira.example.com',
          enabled: false,
          lastSync: null,
          status: 'disconnected'
        },
        {
          id: 'local_database',
          name: 'Local Database',
          type: 'database',
          url: 'local://database',
          enabled: true,
          lastSync: null,
          status: 'connected'
        }
      ];
    } catch (error) {
      console.error('Error loading sync sources:', error);
    }
  }

  /**
   * Setup default sync sources display
   */
  setupDefaultSources() {
    this.updateSourcesList();
    this.updateSyncStatus();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Manual sync button
    const manualSyncBtn = document.getElementById('manualSync');
    if (manualSyncBtn) {
      manualSyncBtn.addEventListener('click', () => this.startManualSync());
    }

    // Auto sync toggle
    const autoSyncToggle = document.getElementById('autoSyncEnabled');
    if (autoSyncToggle) {
      autoSyncToggle.addEventListener('change', (e) => this.toggleAutoSync(e.target.checked));
    }

    // Sync interval setting
    const syncIntervalSelect = document.getElementById('syncInterval');
    if (syncIntervalSelect) {
      syncIntervalSelect.addEventListener('change', (e) => this.setSyncInterval(e.target.value));
    }

    // Add source button
    const addSourceBtn = document.getElementById('addSyncSource');
    if (addSourceBtn) {
      addSourceBtn.addEventListener('click', () => this.showAddSourceDialog());
    }

    // Test connection buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('test-connection-btn')) {
        const sourceId = e.target.getAttribute('data-source-id');
        this.testConnection(sourceId);
      }
    });

    // Source toggle buttons
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('source-toggle')) {
        const sourceId = e.target.getAttribute('data-source-id');
        this.toggleSource(sourceId, e.target.checked);
      }
    });
  }

  /**
   * Update sources list display
   */
  updateSourcesList() {
    const container = document.getElementById('syncSourcesList');
    if (!container) return;

    container.innerHTML = '';

    this.syncSources.forEach(source => {
      const sourceItem = document.createElement('div');
      sourceItem.className = 'sync-source-item';
      sourceItem.innerHTML = `
                <div class="source-header">
                    <div class="source-info">
                        <h4>${source.name}</h4>
                        <span class="source-type">${source.type.toUpperCase()}</span>
                        <span class="source-status status-${source.status}">${source.status}</span>
                    </div>
                    <div class="source-controls">
                        <label class="toggle-switch">
                            <input type="checkbox" class="source-toggle" 
                                   data-source-id="${source.id}" 
                                   ${source.enabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                <div class="source-details">
                    <div class="source-url">${source.url}</div>
                    <div class="source-last-sync">
                        Last Sync: ${source.lastSync ? new Date(source.lastSync).toLocaleString() : 'Never'}
                    </div>
                    <div class="source-actions">
                        <button class="test-connection-btn" data-source-id="${source.id}">Test Connection</button>
                        <button onclick="window.syncFunctions.configureSource('${source.id}')">Configure</button>
                        <button onclick="window.syncFunctions.removeSource('${source.id}')" class="danger">Remove</button>
                    </div>
                </div>
            `;
      container.appendChild(sourceItem);
    });
  }

  /**
   * Update sync status display
   */
  updateSyncStatus() {
    const statusElement = document.getElementById('syncStatus');
    if (!statusElement) return;

    const enabledSources = this.syncSources.filter(s => s.enabled);
    const connectedSources = enabledSources.filter(s => s.status === 'connected');

    statusElement.innerHTML = `
            <div class="sync-status-summary">
                <div class="status-item">
                    <span class="status-label">Total Sources:</span>
                    <span class="status-value">${this.syncSources.length}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Enabled:</span>
                    <span class="status-value">${enabledSources.length}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Connected:</span>
                    <span class="status-value">${connectedSources.length}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Last Sync:</span>
                    <span class="status-value">${this.getLastSyncTime()}</span>
                </div>
            </div>
        `;
  }

  /**
   * Start manual synchronization
   */
  async startManualSync() {
    if (this.activeSync) {
      alert('Sync is already in progress');
      return;
    }

    const enabledSources = this.syncSources.filter(s => s.enabled);
    if (enabledSources.length === 0) {
      alert('No sync sources are enabled');
      return;
    }

    try {
      this.activeSync = {
        id: Date.now(),
        startTime: new Date(),
        sources: enabledSources.map(s => s.id),
        progress: 0,
        status: 'running'
      };

      this.updateSyncProgress(0, 'Starting synchronization...');

      for (let i = 0; i < enabledSources.length; i++) {
        const source = enabledSources[i];
        const progress = Math.round(((i + 1) / enabledSources.length) * 100);

        this.updateSyncProgress(progress, `Syncing ${source.name}...`);
        await this.syncSource(source);

        // Add delay between syncs
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      this.completeSyncOperation('completed');
    } catch (error) {
      console.error('Sync error:', error);
      this.completeSyncOperation('failed', error.message);
    }
  }

  /**
   * Sync individual source
   */
  async syncSource(source) {
    try {
      // Simulate different sync operations based on source type
      switch (source.type) {
        case 'redmine':
          await this.syncRedmine(source);
          break;
        case 'plm':
          await this.syncPLM(source);
          break;
        case 'jira':
          await this.syncJira(source);
          break;
        case 'database':
          await this.syncDatabase(source);
          break;
        default:
          console.warn(`Unknown source type: ${source.type}`);
      }

      source.lastSync = new Date();
      source.status = 'connected';
    } catch (error) {
      source.status = 'error';
      throw error;
    }
  }

  /**
   * Sync with Redmine server
   */
  async syncRedmine(source) {
    console.log(`Syncing with Redmine: ${source.url}`);

    // Simulate API calls
    await this.simulateApiCall('Fetching projects...');
    await this.simulateApiCall('Fetching issues...');
    await this.simulateApiCall('Updating local cache...');

    // In real implementation, this would:
    // - Fetch projects and issues from Redmine API
    // - Update local database
    // - Sync user assignments and status updates
  }

  /**
   * Sync with PLM system
   */
  async syncPLM(source) {
    console.log(`Syncing with PLM: ${source.url}`);

    await this.simulateApiCall('Fetching product data...');
    await this.simulateApiCall('Downloading firmware files...');
    await this.simulateApiCall('Updating product database...');

    // In real implementation, this would:
    // - Sync product information
    // - Download new firmware versions
    // - Update product configurations
  }

  /**
   * Sync with JIRA server
   */
  async syncJira(source) {
    console.log(`Syncing with JIRA: ${source.url}`);

    await this.simulateApiCall('Fetching projects...');
    await this.simulateApiCall('Syncing issues...');
    await this.simulateApiCall('Updating workflows...');
  }

  /**
   * Sync with local database
   */
  async syncDatabase(source) {
    console.log(`Syncing local database: ${source.url}`);

    await this.simulateApiCall('Backing up data...');
    await this.simulateApiCall('Optimizing database...');
    await this.simulateApiCall('Updating indexes...');
  }

  /**
   * Simulate API call with delay
   */
  async simulateApiCall(operation) {
    console.log(operation);
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
  }

  /**
   * Update sync progress display
   */
  updateSyncProgress(progress, message) {
    const progressBar = document.getElementById('syncProgress');
    const progressText = document.getElementById('syncProgressText');

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
      progressBar.setAttribute('aria-valuenow', progress);
    }

    if (progressText) {
      progressText.textContent = message;
    }
  }

  /**
   * Complete sync operation
   */
  completeSyncOperation(status, errorMessage = null) {
    if (this.activeSync) {
      this.activeSync.endTime = new Date();
      this.activeSync.status = status;
      this.activeSync.duration = this.activeSync.endTime - this.activeSync.startTime;

      if (errorMessage) {
        this.activeSync.error = errorMessage;
      }

      // Add to history
      this.syncHistory.unshift(this.activeSync);

      // Keep only last 50 entries
      if (this.syncHistory.length > 50) {
        this.syncHistory = this.syncHistory.slice(0, 50);
      }

      this.activeSync = null;
    }

    // Update UI
    this.updateSourcesList();
    this.updateSyncStatus();
    this.updateSyncHistory();

    const message = status === 'completed' ?
      'Synchronization completed successfully!' :
      `Synchronization failed: ${errorMessage}`;

    this.updateSyncProgress(100, message);

    // Hide progress after delay
    setTimeout(() => {
      this.updateSyncProgress(0, 'Ready');
    }, 3000);
  }

  /**
   * Toggle auto sync
   */
  toggleAutoSync(enabled) {
    if (enabled) {
      const interval = document.getElementById('syncInterval')?.value || 300000; // 5 minutes default
      this.startAutoSync(parseInt(interval));
    } else {
      this.stopAutoSync();
    }
  }

  /**
   * Start auto sync with specified interval
   */
  startAutoSync(intervalMs) {
    this.stopAutoSync(); // Clear existing interval

    this.syncInterval = setInterval(() => {
      if (!this.activeSync) { // Only start if no sync is running
        this.startManualSync();
      }
    }, intervalMs);

    console.log(`Auto sync started with ${intervalMs}ms interval`);
  }

  /**
   * Stop auto sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto sync stopped');
    }
  }

  /**
   * Set sync interval
   */
  setSyncInterval(intervalMs) {
    const autoSyncEnabled = document.getElementById('autoSyncEnabled')?.checked;
    if (autoSyncEnabled) {
      this.startAutoSync(parseInt(intervalMs));
    }
  }

  /**
   * Test connection to a specific source
   */
  async testConnection(sourceId) {
    const source = this.syncSources.find(s => s.id === sourceId);
    if (!source) return;

    try {
      const testBtn = document.querySelector(`[data-source-id="${sourceId}"]`);
      if (testBtn) {
        testBtn.textContent = 'Testing...';
        testBtn.disabled = true;
      }

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Randomly succeed or fail for demo
      const success = Math.random() > 0.3;

      if (success) {
        source.status = 'connected';
        alert(`Connection to ${source.name} successful!`);
      } else {
        source.status = 'error';
        alert(`Connection to ${source.name} failed!`);
      }
    } catch (error) {
      source.status = 'error';
      alert(`Connection test failed: ${error.message}`);
    } finally {
      const testBtn = document.querySelector(`[data-source-id="${sourceId}"]`);
      if (testBtn) {
        testBtn.textContent = 'Test Connection';
        testBtn.disabled = false;
      }
      this.updateSourcesList();
    }
  }

  /**
   * Toggle source enabled/disabled
   */
  toggleSource(sourceId, enabled) {
    const source = this.syncSources.find(s => s.id === sourceId);
    if (source) {
      source.enabled = enabled;
      this.updateSyncStatus();
      console.log(`${source.name} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Configure source settings
   */
  configureSource(sourceId) {
    const source = this.syncSources.find(s => s.id === sourceId);
    if (!source) return;

    // In a real implementation, this would open a configuration dialog
    const newUrl = prompt(`Configure URL for ${source.name}:`, source.url);
    if (newUrl && newUrl !== source.url) {
      source.url = newUrl;
      source.status = 'disconnected'; // Reset status after URL change
      this.updateSourcesList();
    }
  }

  /**
   * Remove source
   */
  removeSource(sourceId) {
    if (confirm('Are you sure you want to remove this sync source?')) {
      this.syncSources = this.syncSources.filter(s => s.id !== sourceId);
      this.updateSourcesList();
      this.updateSyncStatus();
    }
  }

  /**
   * Show add source dialog
   */
  showAddSourceDialog() {
    // In a real implementation, this would show a proper dialog
    const name = prompt('Source Name:');
    if (!name) return;

    const url = prompt('Source URL:');
    if (!url) return;

    const type = prompt('Source Type (redmine/plm/jira/database):');
    if (!type) return;

    const newSource = {
      id: `source_${Date.now()}`,
      name: name,
      type: type.toLowerCase(),
      url: url,
      enabled: true,
      lastSync: null,
      status: 'disconnected'
    };

    this.syncSources.push(newSource);
    this.updateSourcesList();
    this.updateSyncStatus();
  }

  /**
   * Load sync history from storage
   */
  loadSyncHistory() {
    // In real implementation, load from localStorage or server
    this.updateSyncHistory();
  }

  /**
   * Update sync history display
   */
  updateSyncHistory() {
    const container = document.getElementById('syncHistory');
    if (!container) return;

    container.innerHTML = '';

    this.syncHistory.slice(0, 10).forEach(sync => { // Show last 10 syncs
      const historyItem = document.createElement('div');
      historyItem.className = `sync-history-item status-${sync.status}`;

      const duration = sync.duration ? `${Math.round(sync.duration / 1000)}s` : 'N/A';

      historyItem.innerHTML = `
                <div class="history-header">
                    <span class="history-time">${new Date(sync.startTime).toLocaleString()}</span>
                    <span class="history-status">${sync.status.toUpperCase()}</span>
                </div>
                <div class="history-details">
                    <span>Sources: ${sync.sources.length}</span>
                    <span>Duration: ${duration}</span>
                    ${sync.error ? `<span class="error-message">${sync.error}</span>` : ''}
                </div>
            `;

      container.appendChild(historyItem);
    });
  }

  /**
   * Get last sync time
   */
  getLastSyncTime() {
    if (this.syncHistory.length === 0) return 'Never';

    const lastSync = this.syncHistory[0];
    return new Date(lastSync.startTime).toLocaleString();
  }

  /**
   * Get module statistics
   */
  getStats() {
    const enabledSources = this.syncSources.filter(s => s.enabled);
    const connectedSources = enabledSources.filter(s => s.status === 'connected');

    return {
      totalSources: this.syncSources.length,
      enabledSources: enabledSources.length,
      connectedSources: connectedSources.length,
      syncHistory: this.syncHistory.length,
      autoSyncActive: !!this.syncInterval,
      activeSyncRunning: !!this.activeSync,
      initialized: this.initialized
    };
  }

  /**
   * Export sync configuration
   */
  exportSyncConfig() {
    const config = {
      sources: this.syncSources,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'sync-config.json';
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Import sync configuration
   */
  importSyncConfig() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const config = JSON.parse(text);

          if (config.sources && Array.isArray(config.sources)) {
            this.syncSources = config.sources;
            this.updateSourcesList();
            this.updateSyncStatus();
            alert('Sync configuration imported successfully!');
          } else {
            alert('Invalid configuration file format');
          }
        } catch (error) {
          alert('Error importing configuration: ' + error.message);
        }
      }
    };

    fileInput.click();
  }
}

// Create global instance
window.syncFunctions = new SyncFunctions();
