/**
 * ============================================================================
 * FinTrack — Application JavaScript
 * ============================================================================
 * Beginner-friendly, vanilla JavaScript for DOM manipulation, modal handling,
 * real-time filtering, theme toggling, SMS alert auto-parsing, and async Fetch API.
 * 
 * Written with clean, understandable code so any student can explain how it works.
 * ============================================================================
 */

// Run when the DOM content has fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initModals();
  initShortcuts();
  initMobileMenu();
  initTransactionFilters();
  initFormSubmissions();
  initSmsParser();
});

/* ----------------------------------------------------------------------------
 * 1. THEME MANAGEMENT (Light / Dark Mode)
 * ---------------------------------------------------------------------------- */

/**
 * Initializes the visual theme based on saved preferences or system settings.
 */
function initTheme() {
  const savedTheme = localStorage.getItem('fintrack_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  // Bind any theme toggle buttons on the page
  const themeToggleButtons = document.querySelectorAll('.theme-toggle-btn');
  themeToggleButtons.forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
}

/**
 * Toggles between light and dark mode, saving the selection to localStorage.
 */
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('fintrack_theme', isDark ? 'dark' : 'light');
  showToast(isDark ? 'Switched to Dark Mode' : 'Switched to Light Mode', 'info');
}

/* ----------------------------------------------------------------------------
 * 2. MODAL DIALOG MANAGEMENT
 * ---------------------------------------------------------------------------- */

/**
 * Opens a modal dialog by its element ID.
 * @param {string} modalId - The HTML ID of the modal backdrop container.
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    // Focus the first input field inside the modal for keyboard accessibility
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 50);
    }
  }
}

/**
 * Closes a modal dialog by its element ID.
 * @param {string} modalId - The HTML ID of the modal backdrop container.
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Sets up global click and keyboard listeners for all modals on the page.
 */
function initModals() {
  // Close modal when user clicks on the backdrop outside the dialog box
  const modals = document.querySelectorAll('.modal-backdrop');
  modals.forEach(modal => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Close modal when clicking any element with a .modal-close class
  const closeButtons = document.querySelectorAll('.modal-close, [data-close-modal]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  // Open modal triggers with data-modal-target attribute
  const triggers = document.querySelectorAll('[data-modal-target]');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-modal-target');
      openModal(targetId);
    });
  });
}

/* ----------------------------------------------------------------------------
 * 3. KEYBOARD SHORTCUTS
 * ---------------------------------------------------------------------------- */

/**
 * Configures global hotkeys like ESC to dismiss modals and Ctrl+K for search.
 */
function initShortcuts() {
  document.addEventListener('keydown', (event) => {
    // Escape key closes any currently active modal
    if (event.key === 'Escape') {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (activeModal) {
        closeModal(activeModal.id);
      }
    }

    // Ctrl + K or Cmd + K triggers the global command palette
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openModal('commandPaletteModal');
    }

    // 'N' key (when not typing in an input field) opens Add Transaction modal
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    if (!isTyping && (event.key === 'n' || event.key === 'N')) {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (!activeModal) {
        event.preventDefault();
        openModal('addTransactionModal');
      }
    }
  });
}

/* ----------------------------------------------------------------------------
 * 4. MOBILE NAVIGATION DRAWER
 * ---------------------------------------------------------------------------- */

function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (event) => {
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(event.target) &&
          !menuBtn.contains(event.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}

/* ----------------------------------------------------------------------------
 * 5. TOAST NOTIFICATION HELPER
 * ---------------------------------------------------------------------------- */

/**
 * Displays a lightweight toast notification in the corner of the screen.
 * @param {string} message - Text message to show the user.
 * @param {string} type - 'success' | 'error' | 'info' | 'warning'
 */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  // Trigger smooth entrance animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto-dismiss toast after 3.5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ----------------------------------------------------------------------------
 * 6. TRANSACTION FILTERING & SEARCH (Client-Side)
 * ---------------------------------------------------------------------------- */

function initTransactionFilters() {
  const searchInput = document.getElementById('transactionSearchInput');
  const directionPills = document.querySelectorAll('.direction-pill');
  const categorySelect = document.getElementById('categoryFilterSelect');
  const table = document.getElementById('transactionsTable');

  if (!table) return;

  let currentDirection = 'all'; // 'all', 'income', 'expense'

  // Direction pill clicks
  directionPills.forEach(pill => {
    pill.addEventListener('click', () => {
      directionPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentDirection = pill.getAttribute('data-direction');
      applyFilters();
    });
  });

  // Search input typing
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Category select change
  if (categorySelect) {
    categorySelect.addEventListener('change', applyFilters);
  }

  /**
   * Evaluates table rows against active search, direction, and category filters.
   */
  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = categorySelect ? categorySelect.value : '';
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
      const type = row.getAttribute('data-type') || '';
      const category = row.getAttribute('data-category') || '';
      const text = row.textContent.toLowerCase();

      const matchesDirection = (currentDirection === 'all') || (type === currentDirection);
      const matchesCategory = (!selectedCategory) || (category === selectedCategory);
      const matchesQuery = (!query) || (text.includes(query));

      if (matchesDirection && matchesCategory && matchesQuery) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
}

/* ----------------------------------------------------------------------------
 * 7. FORM SUBMISSIONS & ASYNC API INTEGRATION (Fetch API)
 * ---------------------------------------------------------------------------- */

function initFormSubmissions() {
  // A. Add Transaction Form
  const addTxForm = document.getElementById('addTransactionForm');
  if (addTxForm) {
    addTxForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = addTxForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const formData = new FormData(addTxForm);
      const payload = {
        type: formData.get('type'),
        amount: parseFloat(formData.get('amount')),
        accountId: formData.get('accountId'),
        categoryId: formData.get('categoryId'),
        date: formData.get('date'),
        notes: formData.get('notes') || '',
        payee: formData.get('payee') || ''
      };

      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to save transaction');
        }

        showToast('Transaction added successfully!', 'success');
        closeModal('addTransactionModal');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message, 'error');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // B. Add Bank / Account Form
  const addAccForm = document.getElementById('addAccountForm');
  if (addAccForm) {
    addAccForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(addAccForm);
      const payload = {
        name: formData.get('name'),
        type: formData.get('type'),
        openingBalance: parseFloat(formData.get('openingBalance') || 0),
        accountNumber: formData.get('accountNumber') || '',
        color: formData.get('color') || '#065f46'
      };

      try {
        const response = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to create account');
        showToast('Account added successfully!', 'success');
        closeModal('addAccountModal');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // C. Transfer Money Form
  const transferForm = document.getElementById('transferMoneyForm');
  if (transferForm) {
    transferForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(transferForm);
      const payload = {
        fromAccountId: formData.get('fromAccountId'),
        toAccountId: formData.get('toAccountId'),
        amount: parseFloat(formData.get('amount')),
        date: formData.get('date'),
        notes: formData.get('notes') || 'Account Transfer'
      };

      try {
        const response = await fetch('/api/accounts/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Transfer failed');
        showToast('Funds transferred successfully!', 'success');
        closeModal('transferModal');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // D. Create Budget Form
  const addBudgetForm = document.getElementById('addBudgetForm');
  if (addBudgetForm) {
    addBudgetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(addBudgetForm);
      const payload = {
        categoryId: formData.get('categoryId'),
        monthlyLimit: parseFloat(formData.get('monthlyLimit')),
        month: formData.get('month') || '2023-10'
      };

      try {
        const response = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to save budget limit');
        showToast('Budget limit saved!', 'success');
        closeModal('addBudgetModal');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // E. Create Goal Form
  const addGoalForm = document.getElementById('addGoalForm');
  if (addGoalForm) {
    addGoalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(addGoalForm);
      const payload = {
        name: formData.get('name'),
        targetAmount: parseFloat(formData.get('targetAmount')),
        currentAmount: parseFloat(formData.get('currentAmount') || 0),
        targetDate: formData.get('targetDate'),
        color: formData.get('color') || '#10b981'
      };

      try {
        const response = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to create goal');
        showToast('Financial goal created!', 'success');
        closeModal('addGoalModal');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // F. Contribute to Goal Form
  const contributeForm = document.getElementById('contributeGoalForm');
  if (contributeForm) {
    contributeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contributeForm);
      const goalId = formData.get('goalId');
      const payload = {
        amount: parseFloat(formData.get('amount')),
        accountId: formData.get('accountId'),
        date: formData.get('date') || new Date().toISOString().split('T')[0]
      };

      try {
        const response = await fetch(`/api/goals/${goalId}/contribute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to deposit funds');
        showToast('Contribution logged successfully!', 'success');
        closeModal('contributeGoalModal');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // G. Bank Sync Button
  const syncBtn = document.getElementById('syncAccountsBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      syncBtn.innerHTML = '<span>Syncing...</span>';
      try {
        const response = await fetch('/api/sync', { method: 'POST' });
        if (!response.ok) throw new Error('Sync failed');
        showToast('All accounts synced with ICICI, HDFC, and Axis Bank!', 'success');
        setTimeout(() => window.location.reload(), 600);
      } catch (err) {
        showToast(err.message, 'error');
        syncBtn.disabled = false;
        syncBtn.innerHTML = '<span>All accounts synced</span>';
      }
    });
  }
}

/* ----------------------------------------------------------------------------
 * 8. ACTION HELPERS (Delete, Toggle, Export)
 * ---------------------------------------------------------------------------- */

/**
 * Deletes a single transaction by ID after user confirmation.
 * @param {string} txId - Transaction ID to delete.
 */
async function deleteTransaction(txId) {
  if (!confirm('Are you sure you want to delete this transaction?')) return;

  try {
    const response = await fetch(`/api/transactions/${txId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete transaction');
    showToast('Transaction deleted', 'info');
    setTimeout(() => window.location.reload(), 400);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Toggles an automated mandate between Active and Paused.
 * @param {string} mandateId - Mandate ID to toggle.
 */
async function toggleMandate(mandateId) {
  try {
    const response = await fetch(`/api/mandates/${mandateId}/toggle`, { method: 'PUT' });
    if (!response.ok) throw new Error('Failed to update mandate status');
    showToast('Mandate status updated', 'success');
    setTimeout(() => window.location.reload(), 300);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Exports visible transaction ledger data into a downloadable CSV file.
 */
function exportTransactionsCsv() {
  const table = document.getElementById('transactionsTable');
  if (!table) {
    showToast('No transaction table found to export', 'error');
    return;
  }

  const rows = table.querySelectorAll('tr');
  let csvContent = 'Date,Description,Category,Account,Type,Amount\n';

  rows.forEach((row, index) => {
    if (index === 0) return; // skip header
    if (row.style.display === 'none') return; // skip filtered rows

    const cells = row.querySelectorAll('td');
    if (cells.length >= 6) {
      const date = cells[1].innerText.trim();
      const desc = cells[2].innerText.trim().replace(/,/g, ' ');
      const cat = cells[3].innerText.trim();
      const acc = cells[4].innerText.trim();
      const amt = cells[5].innerText.trim().replace(/₹|,/g, '');
      const type = row.getAttribute('data-type') || 'expense';

      csvContent += `${date},"${desc}",${cat},${acc},${type},${amt}\n`;
    }
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `fintrack-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Exported fintrack-ledger.csv', 'success');
}

/**
 * Resets database back to standard demo state.
 */
async function resetDemoData() {
  if (!confirm('Reset all transactions, accounts, and budgets to standard demo data?')) return;
  try {
    const response = await fetch('/api/backup/reset-demo', { method: 'POST' });
    if (!response.ok) throw new Error('Reset failed');
    showToast('Demo data restored successfully!', 'success');
    setTimeout(() => window.location.href = '/', 500);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Clears database to an empty clean slate.
 */
async function clearAllData() {
  if (!confirm('CAUTION: This will delete all your transactions, custom categories, and budgets. Are you sure?')) return;
  try {
    const response = await fetch('/api/backup/clear', { method: 'POST' });
    if (!response.ok) throw new Error('Clear failed');
    showToast('Data cleared to empty slate', 'info');
    setTimeout(() => window.location.href = '/', 500);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ----------------------------------------------------------------------------
 * 9. BANK SMS & EMAIL AUTO-PARSER ENGINE
 * ---------------------------------------------------------------------------- */

let extractedSmsCandidates = [];

function initSmsParser() {
  const sampleButtons = document.querySelectorAll('.sms-sample-btn');
  const textarea = document.getElementById('smsInputText');
  const btnExtract = document.getElementById('btnExtractSms');
  const btnConfirm = document.getElementById('btnConfirmSmsImport');
  const previewSection = document.getElementById('smsPreviewSection');
  const candidatesList = document.getElementById('smsCandidatesList');
  const badgeCount = document.getElementById('smsExtractedBadge');

  if (!textarea || !btnExtract) return;

  const SAMPLE_TEXTS = {
    swiggy: "Sent Rs. 450.00 from HDFC Bank A/C *8921 to SWIGGY on 30-OCT-23. UPI Ref 330412849201.",
    salary: "Salary of INR 85,000.00 credited to A/C ..8921 on 30-OCT-23 by TECH CORP PVT LTD. Avail Bal: INR 1,20,400.00.",
    amazon: "INR 2,499.00 spent on your Card ending 4092 at AMAZON INDIA on 29-Oct-23. Avail Lmt: INR 75,000.00.",
    uber: "Rs 380.00 debited from ICICI Bank A/C **8921 at UBER INDIA on 30-OCT-23. UPI Ref 33012948129.",
    multi: `Sent Rs. 450.00 from HDFC Bank A/C *8921 to SWIGGY on 30-OCT-23. UPI Ref 330412849201.

INR 2,499.00 spent on your Card ending 4092 at AMAZON INDIA on 29-Oct-23.

Rs 380.00 debited from ICICI Bank A/C **8921 at UBER INDIA on 30-OCT-23.

Salary of INR 85,000.00 credited to A/C ..8921 on 30-OCT-23 by TECH CORP PVT LTD.`
  };

  // Click sample buttons to populate text
  sampleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleKey = btn.getAttribute('data-sample');
      if (SAMPLE_TEXTS[sampleKey]) {
        textarea.value = SAMPLE_TEXTS[sampleKey];
        showToast('Sample alert loaded into text box', 'info');
      }
    });
  });

  // Extract & Preview Button Click
  btnExtract.addEventListener('click', async () => {
    const rawText = textarea.value.trim();
    if (!rawText) {
      showToast('Please paste or type an SMS notification first', 'error');
      return;
    }

    btnExtract.disabled = true;
    btnExtract.innerText = 'Extracting...';

    try {
      const response = await fetch('/api/parser/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse text');
      }

      if (data.count === 0) {
        showToast('No transaction amounts found in text. Check the format.', 'warning');
        return;
      }

      extractedSmsCandidates = data.parsed;
      badgeCount.innerText = `${data.count} Candidate${data.count > 1 ? 's' : ''}`;
      previewSection.style.display = 'block';
      if (btnConfirm) btnConfirm.style.display = 'inline-flex';

      // Render candidate cards
      candidatesList.innerHTML = '';
      extractedSmsCandidates.forEach((item) => {
        const card = document.createElement('div');
        card.style.cssText = 'padding: 0.75rem 1rem; background-color: var(--bg-card-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;';
        
        const isIncome = item.type === 'income';
        card.innerHTML = `
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              <span style="font-weight: 700; font-size: 0.95rem;">${item.payee}</span>
              <span class="badge ${isIncome ? 'badge-success' : 'badge-danger'}">${isIncome ? 'Income' : 'Expense'}</span>
              <span class="badge badge-info">${item.categoryId.replace('cat-', '').toUpperCase()}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              Date: <strong>${item.date}</strong> • Account: <strong>${item.accountMask ? '*' + item.accountMask : 'Primary Bank'}</strong>
            </div>
          </div>
          <div style="font-size: 1.15rem; font-weight: 800; color: ${isIncome ? 'var(--accent-income)' : 'var(--accent-expense)'};">
            ${isIncome ? '+' : '-'}₹${parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        `;
        candidatesList.appendChild(card);
      });

      showToast(`Extracted ${data.count} transaction${data.count > 1 ? 's' : ''}! Review and confirm.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btnExtract.disabled = false;
      btnExtract.innerText = 'Extract & Preview Transactions →';
    }
  });

  // Confirm & Import to Ledger
  if (btnConfirm) {
    btnConfirm.addEventListener('click', async () => {
      if (extractedSmsCandidates.length === 0) return;

      btnConfirm.disabled = true;
      btnConfirm.innerText = 'Importing...';

      try {
        const response = await fetch('/api/parser/sms/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: extractedSmsCandidates })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to import transactions');
        }

        showToast(`Successfully added ${data.count} transaction${data.count > 1 ? 's' : ''} to ledger!`, 'success');
        closeModal('smsParserModal');
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        showToast(err.message, 'error');
        btnConfirm.disabled = false;
        btnConfirm.innerText = 'Confirm & Import to Ledger';
      }
    });
  }
}

/* ----------------------------------------------------------------------------
 * 10. BACKGROUND SMS WEBHOOK UTILITIES
 * ---------------------------------------------------------------------------- */

/**
 * Copies the Webhook URL to the clipboard and shows a toast confirmation.
 */
function copyWebhookUrl() {
  const input = document.getElementById('webhookUrlInput');
  if (input) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(input.value).then(() => {
        showToast('Webhook URL copied to clipboard!', 'success');
      }).catch(() => {
        input.select();
        document.execCommand('copy');
        showToast('Webhook URL copied!', 'success');
      });
    } else {
      input.select();
      document.execCommand('copy');
      showToast('Webhook URL copied!', 'success');
    }
  }
}

/**
 * Triggers a live webhook simulation from the UI to test background ingestion.
 */
async function simulateLiveWebhookSms() {
  const btn = document.getElementById('btnSimulateWebhookSms');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Simulating Webhook...</span>';
  }

  try {
    const res = await fetch('/api/webhook/sms/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to simulate webhook');
    }

    if (data.status === 'duplicate') {
      showToast(`Webhook captured alert: Already recorded (${data.message})`, 'info');
    } else if (data.status === 'recorded') {
      const first = (data.imported && data.imported[0]) || {};
      const amountStr = first.amount ? `₹${parseFloat(first.amount).toLocaleString('en-IN')}` : '';
      const payeeStr = first.payee || first.merchant || 'Bank Transaction';
      showToast(`⚡ Background SMS Webhook Received & Logged ${amountStr} (${payeeStr}) into SQLite!`, 'success');
    } else {
      showToast(`Webhook status: ${data.status}`, 'info');
    }
  } catch (err) {
    showToast(`Simulation failed: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>⚡ Simulate Live Bank SMS</span>';
    }
  }
}
