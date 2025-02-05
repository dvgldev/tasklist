const texts = {
    ru: {
        title: "Список задач",
        pageTitle: "Список задач",
        taskListTitle: "Задачи на сегодня",
        formTitle: "Добавить задачу",
        addButton: "Добавить",
        noTasks: "Нет задач",
        placeholderTitle: "Название задачи",
        placeholderDesc: "Описание задачи",
        placeholderCategory: "Категория (через запятую, необязательно)",
        placeholderSearchCategory: "Поиск по категории",
        calendarLocale: "ru-RU",
        langBtn: "RU"
    },
    en: {
        title: "Task List",
        pageTitle: "Task List",
        taskListTitle: "Today's Tasks",
        formTitle: "Add Task",
        addButton: "Add",
        noTasks: "No tasks",
        placeholderTitle: "Task title",
        placeholderDesc: "Task description",
        placeholderCategory: "Category (comma-separated, optional)",
        placeholderSearchCategory: "Search by category",
        calendarLocale: "en-US",
        langBtn: "EN"
    },
    uk: {
        title: "Список завдань",
        pageTitle: "Список завдань",
        taskListTitle: "Завдання на сьогодні",
        formTitle: "Додати завдання",
        addButton: "Додати",
        noTasks: "Немає завдань",
        placeholderTitle: "Назва завдання",
        placeholderDesc: "Опис завдання",
        placeholderCategory: "Категорія (через кому, необов'язково)",
        placeholderSearchCategory: "Пошук за категорією",
        calendarLocale: "uk-UA",
        langBtn: "UA"
    }
};

let currentLanguage = 'uk';
let darkTheme = false;

function updateLanguage() {
    const t = texts[currentLanguage];
    document.getElementById('title').textContent = t.title;
    document.getElementById('header-logo-text').textContent = t.pageTitle;
    document.getElementById('task-list-title').textContent = t.taskListTitle;
    document.getElementById('add-task-title').textContent = t.formTitle;
    document.getElementById('add-task-btn').textContent = t.addButton;
    document.getElementById('task-title').placeholder = t.placeholderTitle;
    document.getElementById('task-desc').placeholder = t.placeholderDesc;
    document.getElementById('task-category').placeholder = t.placeholderCategory;
    document.getElementById('search-category').placeholder = t.placeholderSearchCategory;
    generateCalendarHeader();
    loadTasksForDate(new Date(lastSelectedDate || Date.now()));
    document.getElementById('lang-btn').textContent = t.langBtn;
}

document.getElementById('lang-btn').addEventListener('click', () => {
    if (currentLanguage === 'ru') {
        currentLanguage = 'en';
    } else if (currentLanguage === 'en') {
        currentLanguage = 'uk';
    } else {
        currentLanguage = 'ru';
    }
    updateLanguage();
});

document.getElementById('theme-btn').addEventListener('click', () => {
    darkTheme = !darkTheme;
    if (darkTheme) {
        document.body.classList.add('dark');
        document.getElementById('theme-btn').textContent = "🏙️";
    } else {
        document.body.classList.remove('dark');
        document.getElementById('theme-btn').textContent = "🌃";
    }
});

function updateTime() {
    const timeElem = document.getElementById('time');
    const now = new Date();
    timeElem.textContent = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

let lastSelectedDate = null;

function generateCalendarHeader() {
    const headerElem = document.getElementById('calendar-header');
    const now = new Date();
    headerElem.textContent = now.toLocaleString(texts[currentLanguage].calendarLocale, { month: 'long', year: 'numeric' });
}

function generateCalendar() {
    const calendarElem = document.getElementById('calendar');
    calendarElem.innerHTML = '';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-cell');
        calendarElem.appendChild(emptyCell);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.textContent = day;
        cell.classList.add('calendar-cell');
        if (day === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
            cell.classList.add('today');
        }
        cell.addEventListener('click', () => {
            document.querySelectorAll('#calendar .calendar-cell.active').forEach(c => c.classList.remove('active'));
            cell.classList.add('active');
            lastSelectedDate = new Date(year, month, day);
            loadTasksForDate(lastSelectedDate);
        });
        calendarElem.appendChild(cell);
    }
    generateCalendarHeader();
}
generateCalendar();

let tasks = [];

document.getElementById('task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    const categoriesInput = document.getElementById("task-category").value.trim();
    const categories = categoriesInput
        ? categoriesInput.split(",").map(c => c.trim()).filter(c => c !== "")
        : [];
    const datetimeValue = document.getElementById('task-datetime').value;
    if (!title || !desc || !datetimeValue) return;
    const datetime = new Date(datetimeValue);
    const task = {
        id: Date.now(),
        title,
        shortDesc: desc.length > 180 ? desc.slice(0, 180) + '...' : desc,
        fullDesc: desc,
        categories: categories,
        date: datetime.toLocaleDateString(),
        time: datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: datetime.getTime()
    };
    tasks.push(task);
    document.getElementById('task-form').reset();
    loadTasksForDate(lastSelectedDate || new Date());
});

function getCategoryStyle(category) {
    const mapping = {
        "учеба": { bg: "#e0f7fa", border: "#00acc1", text: "#007c91" },
        "жизнь": { bg: "#e8f5e9", border: "#43a047", text: "#2e7d32" },
        "другое": { bg: "#fce4ec", border: "#d81b60", text: "#c2185b" }
    };
    return mapping[category] || { bg: "#f0f0f0", border: "#ccc", text: "#333" };
}

function loadTasksForDate(date) {
    const formattedDate = date.toLocaleDateString();
    const t = texts[currentLanguage];
    document.getElementById('task-list-title').textContent = t.taskListTitle + " (" + formattedDate + ")";
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    const filtered = tasks.filter(task => task.date === formattedDate);
    const sortOrder = document.getElementById("sort-select").value;
    if (sortOrder === "asc") {
        filtered.sort((a, b) => a.timestamp - b.timestamp);
    } else {
        filtered.sort((a, b) => b.timestamp - a.timestamp);
    }
    if (filtered.length === 0) {
        taskList.innerHTML = `<p>${t.noTasks}</p>`;
    } else {
        filtered.forEach(task => {
            const taskElem = document.createElement('div');
            let categoriesHtml = "";
            if (task.categories && task.categories.length) {
                categoriesHtml = task.categories.map(cat => {
                    const style = getCategoryStyle(cat);
                    return `<span class="task-category" style="background-color: ${style.bg}; border: 1px solid ${style.border}; color: ${style.text};">
              #${cat}
            </span>`;
                }).join(" ");
            }
            taskElem.classList.add('task');
            taskElem.innerHTML = `
          <h3 class="task-title">${task.title}</h3>
          <p class="task-desc" data-full="${task.fullDesc}">${task.shortDesc}</p>
          <div class="task-info">
            <span class="task-date">${task.date}</span> <span class="task-time">${task.time}</span>
          </div>
          ${categoriesHtml}
          <div class="task-actions">
            <button class="delete-btn" data-id="${task.id}">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="red" stroke="red" stroke-width="2"/>
                <line x1="8" y1="8" x2="16" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <line x1="16" y1="8" x2="8" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        `;
            taskElem.querySelector('.task-desc').addEventListener('click', (e) => {
                showModal(e.target.getAttribute('data-full'));
            });
            taskElem.querySelector('.delete-btn').addEventListener('click', () => {
                tasks = tasks.filter(t => t.id !== task.id);
                loadTasksForDate(date);
            });
            taskList.appendChild(taskElem);
        });
    }
}
loadTasksForDate(new Date());

function showModal(text) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-text').textContent = text;
    modal.style.display = 'block';
}

document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

document.getElementById("search-category").addEventListener("input", function () {
    const filterText = this.value.toLowerCase();
    document.querySelectorAll(".task").forEach(taskElem => {
        const categories = Array.from(taskElem.querySelectorAll(".task-category"))
            .map(el => el.textContent.toLowerCase());
        const isMatch = categories.some(cat => cat.includes(filterText));
        taskElem.style.display = isMatch || filterText === "" ? "block" : "none";
    });
});

document.getElementById("sort-select").addEventListener("change", function () {
    loadTasksForDate(lastSelectedDate || new Date());
});

updateLanguage();