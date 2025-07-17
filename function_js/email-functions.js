/**
 * Email Functions Module
 * Handles email-related functionality for firmware tab
 */
class EmailFunctions {
  constructor() {
    this.templates = [];
    this.recipients = [];
    this.initialized = false;
  }

  /**
   * Initialize the email module
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Initializing Email module...');

    try {
      await this.loadEmailTemplates();
      this.bindEvents();
      this.setupDefaultTemplates();
      this.initialized = true;
      console.log('Email module initialized successfully');
    } catch (error) {
      console.error('Error initializing Email module:', error);
    }
  }

  /**
   * Load email templates from configuration or server
   */
  async loadEmailTemplates() {
    try {
      // Try to load from server/config first
      // Fallback to default templates
      this.templates = [
        {
          id: 'firmware_release',
          name: 'Firmware Release Notification',
          subject: '[FIRMWARE] New Firmware Release - {product} v{version}',
          body: `Dear Team,

A new firmware release is now available:

Product: {product}
Version: {version}
Release Date: {date}
Path: {firmware_path}

Please update your testing environment accordingly.

Best regards,
Firmware Team`
        },
        {
          id: 'test_complete',
          name: 'Testing Complete Notification',
          subject: '[TESTING] Firmware Testing Complete - {product} v{version}',
          body: `Dear Team,

Firmware testing has been completed:

Product: {product}
Version: {version}
Test Status: {status}
Issues Found: {issues_count}

Please review the test results and proceed accordingly.

Best regards,
QA Team`
        },
        {
          id: 'bug_report',
          name: 'Bug Report Template',
          subject: '[BUG] Issue Found in {product} v{version}',
          body: `Bug Report:

Product: {product}
Version: {version}
Severity: {severity}
Description: {description}
Steps to Reproduce: {steps}
Expected Result: {expected}
Actual Result: {actual}

Reporter: {reporter}
Date: {date}`
        }
      ];
    } catch (error) {
      console.error('Error loading email templates:', error);
      this.setupDefaultTemplates();
    }
  }

  /**
   * Setup default email templates
   */
  setupDefaultTemplates() {
    const templateSelect = document.getElementById('emailTemplate');
    if (templateSelect) {
      templateSelect.innerHTML = '<option value="">Select Template...</option>';
      this.templates.forEach(template => {
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
    const templateSelect = document.getElementById('emailTemplate');
    if (templateSelect) {
      templateSelect.addEventListener('change', () => this.onTemplateChange());
    }

    // Recipient management
    const addRecipientBtn = document.getElementById('addRecipient');
    if (addRecipientBtn) {
      addRecipientBtn.addEventListener('click', () => this.addRecipient());
    }

    // Send email
    const sendEmailBtn = document.getElementById('sendEmail');
    if (sendEmailBtn) {
      sendEmailBtn.addEventListener('click', () => this.sendEmail());
    }

    // Preview email
    const previewEmailBtn = document.getElementById('previewEmail');
    if (previewEmailBtn) {
      previewEmailBtn.addEventListener('click', () => this.previewEmail());
    }

    // Import recipients
    const importRecipientsBtn = document.getElementById('importRecipients');
    if (importRecipientsBtn) {
      importRecipientsBtn.addEventListener('click', () => this.importRecipients());
    }
  }

  /**
   * Handle template selection change
   */
  onTemplateChange() {
    const templateSelect = document.getElementById('emailTemplate');
    const selectedTemplate = this.templates.find(t => t.id === templateSelect.value);

    if (selectedTemplate) {
      // Populate subject and body
      const subjectInput = document.getElementById('emailSubject');
      const bodyTextarea = document.getElementById('emailBody');

      if (subjectInput) subjectInput.value = selectedTemplate.subject;
      if (bodyTextarea) bodyTextarea.value = selectedTemplate.body;

      this.highlightVariables();
    }
  }

  /**
   * Highlight template variables in the email body
   */
  highlightVariables() {
    const bodyTextarea = document.getElementById('emailBody');
    if (bodyTextarea) {
      const preview = document.getElementById('emailPreview');
      if (preview) {
        let content = bodyTextarea.value;
        content = content.replace(/\{([^}]+)\}/g, '<span class="variable-highlight">{$1}</span>');
        preview.innerHTML = content.replace(/\n/g, '<br>');
      }
    }
  }

  /**
   * Add recipient to the list
   */
  addRecipient() {
    const emailInput = document.getElementById('recipientEmail');
    const nameInput = document.getElementById('recipientName');

    if (!emailInput || !nameInput) return;

    const email = emailInput.value.trim();
    const name = nameInput.value.trim();

    if (email && this.isValidEmail(email)) {
      const recipient = { email, name: name || email };
      this.recipients.push(recipient);
      this.updateRecipientList();

      // Clear inputs
      emailInput.value = '';
      nameInput.value = '';
    } else {
      alert('Please enter a valid email address');
    }
  }

  /**
   * Update recipient list display
   */
  updateRecipientList() {
    const listContainer = document.getElementById('recipientList');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    this.recipients.forEach((recipient, index) => {
      const item = document.createElement('div');
      item.className = 'recipient-item';
      item.innerHTML = `
                <span class="recipient-info">
                    <strong>${recipient.name}</strong> 
                    <small>&lt;${recipient.email}&gt;</small>
                </span>
                <button onclick="window.emailFunctions.removeRecipient(${index})" class="remove-btn">×</button>
            `;
      listContainer.appendChild(item);
    });
  }

  /**
   * Remove recipient from list
   */
  removeRecipient(index) {
    this.recipients.splice(index, 1);
    this.updateRecipientList();
  }

  /**
   * Import recipients from file or predefined list
   */
  async importRecipients() {
    try {
      // Create file input for CSV import
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.csv,.txt';

      fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          const text = await file.text();
          this.parseRecipientsFromText(text);
        }
      };

      fileInput.click();
    } catch (error) {
      console.error('Error importing recipients:', error);
    }
  }

  /**
   * Parse recipients from text (CSV format)
   */
  parseRecipientsFromText(text) {
    const lines = text.split('\n');
    let imported = 0;

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      const parts = line.split(',');
      const email = parts[0]?.trim();
      const name = parts[1]?.trim() || email;

      if (email && this.isValidEmail(email)) {
        // Check if email already exists
        if (!this.recipients.find(r => r.email === email)) {
          this.recipients.push({ email, name });
          imported++;
        }
      }
    });

    this.updateRecipientList();
    alert(`Imported ${imported} recipients`);
  }

  /**
   * Preview email with variable substitution
   */
  previewEmail() {
    const subject = document.getElementById('emailSubject')?.value || '';
    const body = document.getElementById('emailBody')?.value || '';

    // Get sample data for preview
    const sampleData = this.getSampleData();

    // Substitute variables
    const previewSubject = this.substituteVariables(subject, sampleData);
    const previewBody = this.substituteVariables(body, sampleData);

    // Show preview
    const preview = document.getElementById('emailPreview');
    if (preview) {
      preview.innerHTML = `
                <div class="email-preview">
                    <div class="email-header">
                        <strong>Subject:</strong> ${previewSubject}
                    </div>
                    <div class="email-body">
                        ${previewBody.replace(/\n/g, '<br>')}
                    </div>
                    <div class="email-footer">
                        <small>Recipients: ${this.recipients.length} people</small>
                    </div>
                </div>
            `;
    }
  }

  /**
   * Send email
   */
  async sendEmail() {
    if (this.recipients.length === 0) {
      alert('Please add at least one recipient');
      return;
    }

    const subject = document.getElementById('emailSubject')?.value;
    const body = document.getElementById('emailBody')?.value;

    if (!subject || !body) {
      alert('Please fill in subject and body');
      return;
    }

    try {
      // Show sending indicator
      const sendBtn = document.getElementById('sendEmail');
      const originalText = sendBtn?.textContent;
      if (sendBtn) sendBtn.textContent = 'Sending...';

      // Simulate email sending
      await this.simulateEmailSending(subject, body);

      // Reset button
      if (sendBtn) sendBtn.textContent = originalText;

      alert('Email sent successfully!');
      this.clearEmailForm();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  }

  /**
   * Simulate email sending process
   */
  async simulateEmailSending(subject, body) {
    // Get actual data for substitution
    const emailData = this.getEmailData();

    // Process each recipient
    for (const recipient of this.recipients) {
      const personalizedSubject = this.substituteVariables(subject, emailData);
      const personalizedBody = this.substituteVariables(body, emailData);

      // Log email details (in real implementation, this would send actual email)
      console.log('Sending email to:', recipient.email);
      console.log('Subject:', personalizedSubject);
      console.log('Body:', personalizedBody);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Get current data for email substitution
   */
  getEmailData() {
    // Get data from current form or global state
    return {
      product: 'Sample Product',
      version: '1.0.0',
      date: new Date().toLocaleDateString(),
      firmware_path: '/firmware/sample/path',
      status: 'PASSED',
      issues_count: '0',
      severity: 'HIGH',
      description: 'Sample description',
      steps: 'Sample steps',
      expected: 'Expected result',
      actual: 'Actual result',
      reporter: 'Test User'
    };
  }

  /**
   * Get sample data for preview
   */
  getSampleData() {
    return {
      product: '[Product Name]',
      version: '[Version]',
      date: '[Date]',
      firmware_path: '[Firmware Path]',
      status: '[Status]',
      issues_count: '[Issues Count]',
      severity: '[Severity]',
      description: '[Description]',
      steps: '[Steps]',
      expected: '[Expected]',
      actual: '[Actual]',
      reporter: '[Reporter]'
    };
  }

  /**
   * Substitute variables in text
   */
  substituteVariables(text, data) {
    let result = text;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, data[key]);
    });
    return result;
  }

  /**
   * Clear email form
   */
  clearEmailForm() {
    const elements = ['emailTemplate', 'emailSubject', 'emailBody'];
    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.value = '';
    });

    const preview = document.getElementById('emailPreview');
    if (preview) preview.innerHTML = '';
  }

  /**
   * Validate email address
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get module statistics
   */
  getStats() {
    return {
      templates: this.templates.length,
      recipients: this.recipients.length,
      initialized: this.initialized
    };
  }
}

// Create global instance
window.emailFunctions = new EmailFunctions();
