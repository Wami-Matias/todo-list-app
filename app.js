class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.render();
    }

    cacheElements() {
        this.$taskInput = document.getElementById('taskInput');
        this.$addBtn = document.getElementById('addBtn');
        this.$taskList = document.getElementById('taskList');
        this.$emptyState = document.querySelector('.empty-state');
        this.$totalTasks = document.getElementById('totalTasks');
        this.$completedTasks = document.getElementById('completedTasks');
        this.$clearBtn = document.getElementById('clearBtn');
        this.$filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        this.$addBtn.addEventListener('click', () => this.addTask());
        this.$taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.$clearBtn.addEventListener('click', () => this.clearCompleted());
        this.$filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    addTask() {
        const text = this.$taskInput.value.trim();
        
        if (!text) {
            alert('Por favor, adiciona uma tarefa!');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString('pt-AO')
        };

        this.tasks.push(task);
        this.saveTasks();
        this.$taskInput.value = '';
        this.$taskInput.focus();
        this.render();
    }

    deleteTask(id) {
        if (confirm('Tens a certeza que queres apagar?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            alert('Não há tarefas completas para apagar!');
            return;
        }

        if (confirm(`Apagar ${completedCount} tarefa(s) completa(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.$filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        
        this.$totalTasks.textContent = `${total} tarefa${total !== 1 ? 's' : ''}`;
        this.$completedTasks.textContent = `${completed} completa${completed !== 1 ? 's' : ''}`;
        
        this.$clearBtn.disabled = completed === 0;
    }

    render() {
        const filtered = this.getFilteredTasks();
        this.$taskList.innerHTML = filtered.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="app.toggleTask(${task.id})"
                >
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="app.deleteTask(${task.id})">
                    Apagar
                </button>
            </li>
        `).join('');

        const hasAnyTasks = this.tasks.length > 0;
        this.$emptyState.classList.toggle('show', !hasAnyTasks);

        this.updateStats();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializa a app
const app = new TodoApp();