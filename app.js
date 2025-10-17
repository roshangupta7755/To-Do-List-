// TodoList Pro Application
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentEditingId = null;
        this.init();
    }

    init() {
        // Show splash screen then initialize app
        setTimeout(() => {
            this.hideSplashScreen();
            this.initializeApp();
        }, 1000);
    }

    hideSplashScreen() {
        const splashScreen = document.getElementById('splash-screen');
        const mainApp = document.getElementById('main-app');
        
        splashScreen.style.display = 'none';
        mainApp.classList.remove('hidden');
    }

    initializeApp() {
        this.loadTasks();
        this.bindEvents();
        this.updateTaskCount();
        this.showEmptyState();
    }

    bindEvents() {
        // Modal events
        document.getElementById('add-task-btn').addEventListener('click', () => this.showTaskForm());
        document.getElementById('close-modal').addEventListener('click', () => this.hideTaskForm());
        document.getElementById('modal-overlay').addEventListener('click', () => this.hideTaskForm());
        document.getElementById('cancel-btn').addEventListener('click', () => this.hideTaskForm());
        
        // Form events
        document.getElementById('task-form').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('task-screenshot').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('remove-image').addEventListener('click', () => this.removeImage());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideTaskForm();
            }
        });
    }

    loadTasks() {
        // Using in-memory storage for task persistence
        if (this.tasks.length === 0) {
            // Initialize empty task array
            this.tasks = [];
        }
        this.renderTasks();
    }

    saveTasks() {
        // Using in-memory storage for task persistence
        // Tasks are automatically saved in the application state
        console.log('Tasks saved:', this.tasks);
    }

    showTaskForm(taskId = null) {
        const modal = document.getElementById('task-form-modal');
        const formTitle = document.getElementById('form-title');
        const form = document.getElementById('task-form');
        
        if (taskId) {
            // Edit mode
            this.currentEditingId = taskId;
            const task = this.tasks.find(t => t.id === taskId);
            formTitle.textContent = 'Edit Task';
            
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-deadline').value = task.deadline || '';
            document.getElementById('task-alarm').value = task.alarm || '';
            
            if (task.image) {
                this.showImagePreview(task.image);
            }
        } else {
            // Add mode
            this.currentEditingId = null;
            formTitle.textContent = 'Add New Task';
            form.reset();
            this.hideImagePreview();
        }
        
        modal.classList.remove('hidden');
        document.getElementById('task-title').focus();
    }

    hideTaskForm() {
        const modal = document.getElementById('task-form-modal');
        modal.classList.add('hidden');
        this.currentEditingId = null;
        document.getElementById('task-form').reset();
        this.hideImagePreview();
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const deadline = document.getElementById('task-deadline').value;
        const alarm = document.getElementById('task-alarm').value;
        const imagePreview = document.getElementById('preview-img');
        const image = imagePreview.src && imagePreview.src !== window.location.href ? imagePreview.src : null;
        
        if (!title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }
        
        this.showButtonLoading(true);
        
        // Simulate API delay
        setTimeout(() => {
            if (this.currentEditingId) {
                // Edit existing task
                const taskIndex = this.tasks.findIndex(t => t.id === this.currentEditingId);
                if (taskIndex !== -1) {
                    this.tasks[taskIndex] = {
                        ...this.tasks[taskIndex],
                        title,
                        description,
                        deadline,
                        alarm,
                        image,
                        updatedAt: new Date().toISOString()
                    };
                    this.showSaveConfirmation();
                    this.showToast('Task updated successfully!', 'success');
                }
            } else {
                // Add new task
                const newTask = {
                    id: Date.now(),
                    title,
                    description,
                    deadline,
                    alarm,
                    image,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                this.tasks.unshift(newTask);
                this.showSaveConfirmation();
                this.showToast('Task added successfully!', 'success');
            }
            
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCount();
            
            setTimeout(() => {
                this.hideTaskForm();
                this.showButtonLoading(false);
            }, 800);
            
            // Set up alarm if specified
            if (alarm) {
                this.setTaskAlarm(title, alarm);
            }
        }, 500);
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.showImagePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                this.showToast('Please select a valid image file', 'error');
                e.target.value = '';
            }
        }
    }

    showImagePreview(imageSrc) {
        const imagePreview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        
        previewImg.src = imageSrc;
        imagePreview.classList.remove('hidden');
    }

    hideImagePreview() {
        const imagePreview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        
        previewImg.src = '';
        imagePreview.classList.add('hidden');
        document.getElementById('task-screenshot').value = '';
    }

    removeImage() {
        this.hideImagePreview();
    }

    renderTasks() {
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');
        
        if (this.tasks.length === 0) {
            this.showEmptyState();
            return;
        }
        
        emptyState.classList.add('hidden');
        taskList.innerHTML = '';
        
        this.tasks.forEach((task, index) => {
            const taskCard = this.createTaskCard(task, index);
            taskList.appendChild(taskCard);
        });
    }

    createTaskCard(task, index) {
        const card = document.createElement('div');
        const deadlineStatus = this.getDeadlineStatus(task.deadline);
        
        card.className = `task-card ${task.completed ? 'completed' : ''} ${deadlineStatus.class}`;
        card.style.animationDelay = `${index * 0.1}s`;
        
        const deadlineHtml = task.deadline ? `
            <div class="task-meta-item task-deadline ${deadlineStatus.class}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span class="countdown-text">${deadlineStatus.text}</span>
            </div>
        ` : '';
        
        const alarmHtml = task.alarm ? `
            <div class="task-meta-item task-alarm ${this.isAlarmTime(task.alarm) ? 'active' : ''}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                ${this.formatTime(task.alarm)}
            </div>
        ` : '';
        
        card.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="app.toggleTask(${task.id})">
                <div class="task-content">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                    
                    <div class="task-meta">
                        ${deadlineHtml}
                        ${alarmHtml}
                        <span class="task-date">${this.formatDate(task.createdAt)}</span>
                    </div>
                    
                    ${task.image ? `
                        <div class="task-image">
                            <img src="${task.image}" alt="Task screenshot" onclick="app.viewImage('${task.image}')">
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="task-actions">
                <button class="task-action-btn edit" onclick="app.editTask(${task.id})" title="Edit task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="task-action-btn delete" onclick="app.deleteTask(${task.id})" title="Delete task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        `;
        
        return card;
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCount();
            
            const message = task.completed ? 'Task completed!' : 'Task marked as incomplete';
            this.showToast(message, 'success');
        }
    }

    editTask(taskId) {
        this.showTaskForm(taskId);
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskCard = document.querySelector(`[onclick*="${taskId}"]`).closest('.task-card');
            
            // Animate removal
            taskCard.style.animation = 'taskSlideOut 0.3s ease-in-out forwards';
            
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCount();
                this.showToast('Task deleted successfully', 'success');
            }, 300);
        }
    }

    viewImage(imageSrc) {
        // Simple image viewer
        const viewer = document.createElement('div');
        viewer.className = 'image-viewer';
        viewer.innerHTML = `
            <div class="image-viewer-overlay" onclick="this.parentElement.remove()">
                <div class="image-viewer-content">
                    <img src="${imageSrc}" alt="Task image" style="max-width: 90vw; max-height: 90vh; border-radius: 8px;">
                    <button onclick="this.closest('.image-viewer').remove()" style="
                        position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.7); 
                        color: white; border: none; border-radius: 50%; width: 40px; height: 40px; 
                        cursor: pointer; display: flex; align-items: center; justify-content: center;
                    ">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        viewer.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.9); z-index: 10000; display: flex; 
            align-items: center; justify-content: center; cursor: pointer;
        `;
        
        document.body.appendChild(viewer);
    }

    setTaskAlarm(taskTitle, alarmTime) {
        if ('Notification' in window) {
            // Request notification permission
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.scheduleAlarm(taskTitle, alarmTime);
                    }
                });
            } else if (Notification.permission === 'granted') {
                this.scheduleAlarm(taskTitle, alarmTime);
            }
        }
    }

    scheduleAlarm(taskTitle, alarmTime) {
        const now = new Date();
        const [hours, minutes] = alarmTime.split(':');
        const alarmDate = new Date();
        alarmDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // If alarm time is in the past for today, schedule for tomorrow
        if (alarmDate <= now) {
            alarmDate.setDate(alarmDate.getDate() + 1);
        }
        
        const timeUntilAlarm = alarmDate.getTime() - now.getTime();
        
        setTimeout(() => {
            new Notification(`Reminder: ${taskTitle}`, {
                body: `It's time for your scheduled task!`,
                icon: '/favicon.ico',
                tag: 'todo-alarm'
            });
            
            // Schedule daily recurring alarm
            setInterval(() => {
                new Notification(`Daily Reminder: ${taskTitle}`, {
                    body: `It's time for your daily task!`,
                    icon: '/favicon.ico',
                    tag: 'todo-daily-alarm'
                });
            }, 24 * 60 * 60 * 1000); // 24 hours
            
        }, timeUntilAlarm);
        
        this.showToast(`Alarm set for ${this.formatTime(alarmTime)}`, 'success');
    }

    updateTaskCount() {
        const taskCount = document.getElementById('task-count');
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        
        taskCount.textContent = `${total} task${total !== 1 ? 's' : ''} (${completed} completed)`;
    }

    showEmptyState() {
        const emptyState = document.getElementById('empty-state');
        emptyState.classList.remove('hidden');
    }

    showButtonLoading(loading) {
        const saveBtn = document.getElementById('save-btn');
        const btnText = saveBtn.querySelector('.btn-text');
        const btnLoading = saveBtn.querySelector('.btn-loading');
        const btnSaved = saveBtn.querySelector('.btn-saved');
        
        if (loading) {
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            btnSaved.classList.add('hidden');
            saveBtn.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            btnSaved.classList.add('hidden');
            saveBtn.disabled = false;
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
            error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
            warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
        };
        
        toast.innerHTML = `
            <div class="toast-icon" style="color: var(--color-${type});">${icons[type]}</div>
            <div class="toast-message">${this.escapeHtml(message)}</div>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-in-out forwards';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour12 = parseInt(hours) % 12 || 12;
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        
        return date.toLocaleDateString();
    }

    getDeadlineStatus(deadline) {
        if (!deadline) return { class: '', text: '' };
        
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const timeDiff = deadlineDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
        
        if (timeDiff < 0) {
            const overdueDays = Math.abs(daysDiff);
            return {
                class: 'deadline-overdue',
                text: overdueDays === 0 ? 'Overdue' : `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`
            };
        }
        
        if (daysDiff === 0) {
            if (hoursDiff <= 1) {
                return { class: 'deadline-overdue', text: 'Due now!' };
            } else if (hoursDiff <= 6) {
                return { class: 'deadline-warning', text: `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} left` };
            } else {
                return { class: 'deadline-warning', text: 'Due today' };
            }
        }
        
        if (daysDiff === 1) {
            return { class: 'deadline-warning', text: 'Due tomorrow' };
        }
        
        if (daysDiff <= 3) {
            return { class: 'deadline-warning', text: `${daysDiff} days left` };
        }
        
        return { class: 'deadline-good', text: `${daysDiff} days left` };
    }
    
    isAlarmTime(alarmTime) {
        if (!alarmTime) return false;
        
        const now = new Date();
        const [hours, minutes] = alarmTime.split(':');
        const alarmDate = new Date();
        alarmDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Check if current time is within 5 minutes of alarm time
        const timeDiff = Math.abs(now.getTime() - alarmDate.getTime());
        return timeDiff <= 5 * 60 * 1000; // 5 minutes in milliseconds
    }
    
    showSaveConfirmation() {
        const saveBtn = document.getElementById('save-btn');
        const btnText = saveBtn.querySelector('.btn-text');
        const btnLoading = saveBtn.querySelector('.btn-loading');
        const btnSaved = saveBtn.querySelector('.btn-saved');
        
        // Hide loading, show saved confirmation
        btnText.classList.add('hidden');
        btnLoading.classList.add('hidden');
        btnSaved.classList.remove('hidden');
        
        // Add success animation to button
        saveBtn.classList.add('save-success');
        
        setTimeout(() => {
            saveBtn.classList.remove('save-success');
        }, 800);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add slide out animation for task removal
const style = document.createElement('style');
style.textContent = `
    @keyframes taskSlideOut {
        to {
            opacity: 0;
            transform: translateX(-100%);
            height: 0;
            margin: 0;
            padding: 0;
        }
    }
    
    @keyframes toastSlideOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
const app = new TodoApp();

// Global functions for onclick handlers
window.app = app;