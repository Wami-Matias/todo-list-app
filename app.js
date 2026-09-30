const STORAGE_KEY = 'todo-list-app-tasks';
let tasks = loadTasks();
let filter = 'all';

const form = document.querySelector('#taskForm');
const input = document.querySelector('#taskInput');
const list = document.querySelector('#taskList');
const empty = document.querySelector('#emptyState');
const taskCount = document.querySelector('#taskCount');
const completedCount = document.querySelector('#completedCount');
const clearButton = document.querySelector('#clearCompleted');

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function visibleTasks() {
  if (filter === 'active') return tasks.filter(task => !task.completed);
  if (filter === 'completed') return tasks.filter(task => task.completed);
  return tasks;
}

function render() {
  const shown = visibleTasks();
  list.innerHTML = shown.map(task => `
    <li class="task ${task.completed ? 'completed' : ''}">
      <input type="checkbox" ${task.completed ? 'checked' : ''} data-toggle="${task.id}" aria-label="Concluir tarefa">
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="delete" type="button" data-delete="${task.id}">Apagar</button>
    </li>
  `).join('');

  empty.textContent = tasks.length === 0 ? 'Ainda não tens tarefas.' : 'Nenhuma tarefa neste filtro.';
  empty.classList.toggle('hidden', shown.length > 0);
  const completed = tasks.filter(task => task.completed).length;
  taskCount.textContent = `${tasks.length} tarefa${tasks.length === 1 ? '' : 's'}`;
  completedCount.textContent = `${completed} concluída${completed === 1 ? '' : 's'}`;
  clearButton.disabled = completed === 0;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return input.focus();
  tasks.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), text, completed: false });
  saveTasks();
  input.value = '';
  render();
  input.focus();
});

list.addEventListener('click', event => {
  const deleteButton = event.target.closest('[data-delete]');
  if (deleteButton) {
    tasks = tasks.filter(task => String(task.id) !== deleteButton.dataset.delete);
    saveTasks();
    render();
  }
});

list.addEventListener('change', event => {
  const checkbox = event.target.closest('[data-toggle]');
  if (!checkbox) return;
  const task = tasks.find(item => String(item.id) === checkbox.dataset.toggle);
  if (task) task.completed = checkbox.checked;
  saveTasks();
  render();
});

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('active', item === button));
    render();
  });
});

clearButton.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
});

render();
