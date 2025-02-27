// Local storage keys
const STORAGE_KEY = 'farewell_journal_data';
const PASSWORD_KEY = 'farewell_journal_password';

// Default password (you should change this)
const DEFAULT_PASSWORD = 'farewell2025';

// Initialize data
function initializeJournal() {
    if (!localStorage.getItem(PASSWORD_KEY)) {
        localStorage.setItem(PASSWORD_KEY, DEFAULT_PASSWORD);
    }
    
    if (!localStorage.getItem(STORAGE_KEY)) {
        const initialData = {
            journalName: 'Digital Farewell Journal',
            ownerName: '',
            messages: []
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
}

// Get data from local storage
function getJournalData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

// Save data to local storage
function saveJournalData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// DOM elements
let loginSection;
let journalSection;
let messageFormSection;
let messagesList;
let submitMessage;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize storage
    initializeJournal();
    
    // Get DOM elements
    loginSection = document.getElementById('loginSection');
    journalSection = document.getElementById('journalSection');
    messageFormSection = document.getElementById('messageFormSection');
    messagesList = document.getElementById('messagesList');
    submitMessage = document.getElementById('submitMessage');
    
    // Set up event listeners
    setupEventListeners();
    
    // Show initial view
    showInitialView();
});

// Set up all event listeners
function setupEventListeners() {
    // Login button
    document.getElementById('loginButton').addEventListener('click', handleLogin);
    
    // Logout button
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    
    // Submit button
    document.getElementById('submitButton').addEventListener('click', handleSubmitMessage);
    
    // Export button
    document.getElementById('exportButton').addEventListener('click', handleExportData);
    
    // Navigation links
    document.getElementById('leaveMessageLink').addEventListener('click', function(e) {
        e.preventDefault();
        showView('message');
    });
    
    document.getElementById('ownerAccessLink').addEventListener('click', function(e) {
        e.preventDefault();
        showView('login');
    });
}

// Handle login attempt
function handleLogin() {
    const password = document.getElementById('password').value;
    const storedPassword = localStorage.getItem(PASSWORD_KEY);
    
    if (password === storedPassword) {
        showView('journal');
        renderMessages();
    } else {
        alert('Incorrect password. Please try again.');
    }
}

// Handle logout
function handleLogout() {
    showView('message');
    document.getElementById('password').value = '';
}

// Handle message submission
function handleSubmitMessage() {
    const senderName = document.getElementById('senderName').value.trim();
    const messageContent = document.getElementById('messageContent').value.trim();
    
    if (!senderName || !messageContent) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }
    
    const data = getJournalData();
    data.messages.push({
        sender: senderName,
        content: messageContent,
        date: new Date().toISOString()
    });
    
    saveJournalData(data);
    
    document.getElementById('senderName').value = '';
    document.getElementById('messageContent').value = '';
    
    showNotification('Message submitted successfully! Thank you for your farewell note.', 'success');
}

// Show notification
function showNotification(message, type) {
    submitMessage.textContent = message;
    submitMessage.className = 'message ' + type;
    
    setTimeout(() => {
        submitMessage.textContent = '';
        submitMessage.className = 'message';
    }, 5000);
}

// Handle exporting data
function handleExportData() {
    const data = getJournalData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'farewell_journal_export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Show specific view
function showView(view) {
    loginSection.style.display = 'none';
    journalSection.style.display = 'none';
    messageFormSection.style.display = 'none';
    
    switch(view) {
        case 'login':
            loginSection.style.display = 'block';
            break;
        case 'journal':
            journalSection.style.display = 'block';
            break;
        case 'message':
            messageFormSection.style.display = 'block';
            break;
    }
}

// Show initial view
function showInitialView() {
    showView('message');
}

// Render messages in the journal
function renderMessages() {
    const data = getJournalData();
    
    if (data.messages.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No messages yet</h3>
                <p>When people leave you messages, they'll appear here.</p>
            </div>
        `;
        return;
    }
    
    messagesList.innerHTML = '';
    
    // Sort messages by date (newest first)
    data.messages.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    data.messages.forEach(message => {
        const date = new Date(message.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const messageEl = document.createElement('div');
        messageEl.className = 'note-card';
        messageEl.innerHTML = `
            <div class="note-header">
                <div class="note-name">${message.sender}</div>
                <div class="note-date">${formattedDate}</div>
            </div>
            <div class="note-content">${message.content}</div>
        `;
        
        messagesList.appendChild(messageEl);
    });
}