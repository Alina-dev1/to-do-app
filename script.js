const openModalBtn = document.querySelector("#openModalBtn");
const closeModalBtn = document.querySelector("#closeModalBtn");
const cancelBtn = document.querySelector("#cancelBtn");
const taskModal = document.querySelector("#taskModal");

const taskForm = document.querySelector("#taskForm");
const taskName = document.querySelector("#taskName");
const taskPriority = document.querySelector("#taskPriority");
const taskCategory = document.querySelector("#taskCategory");
const taskDeadline = document.querySelector("#taskDeadline");
const taskTime = document.querySelector("#taskTime");

const editTaskId = document.querySelector("#editTaskId");
const modalTitle = document.querySelector("#modalTitle");
const saveTaskBtn = document.querySelector("#saveTaskBtn");

const doNowList = document.querySelector("#doNowList");
const doNextList = document.querySelector("#doNextList");
const laterList = document.querySelector("#laterList");

const totalTasks = document.querySelector("#totalTasks");
const highPriorityTasks = document.querySelector("#highPriorityTasks");
const dueTodayTasks = document.querySelector("#dueTodayTasks");
const completedTasks = document.querySelector("#completedTasks");

const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
const progressMessage = document.querySelector("#progressMessage");

const priorityFilter = document.querySelector("#priorityFilter");
const filterButtons = document.querySelectorAll(".filter-btn");

const themeBtn = document.querySelector("#themeBtn");
const currentDate = document.querySelector("#currentDate");

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

let currentStatusFilter = "all";

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-US", {
weekday: "long",
month: "short",
day: "numeric"
});

function openModal() {
taskModal.classList.remove("hidden");
}

function closeModal() {
taskModal.classList.add("hidden");
taskForm.reset();
editTaskId.value = "";
modalTitle.textContent = "Create New Task";
saveTaskBtn.textContent = "Add Task";
}

openModalBtn.addEventListener("click", openModal);

closeModalBtn.addEventListener("click", closeModal);

cancelBtn.addEventListener("click", closeModal);

taskModal.addEventListener("click", function (event) {
if (event.target === taskModal) {
closeModal();
}
});

taskForm.addEventListener("submit", function (event) {
event.preventDefault();
const name = taskName.value.trim();

if (name === "") {
    return;
}

const taskData = {
    id: editTaskId.value || Date.now().toString(),
    name: name,
    priority: taskPriority.value,
    category: taskCategory.value,
    deadline: taskDeadline.value,
    estimatedTime: taskTime.value,
    completed: false
};


if (editTaskId.value) {

    const oldTask = tasks.find(function (task) {
        return task.id === editTaskId.value;
    });

    taskData.completed = oldTask.completed;

    tasks = tasks.map(function (task) {

        if (task.id === editTaskId.value) {
            return taskData;
        }

        return task;
    });

} else {

    tasks.push(taskData);

}


saveTasks();
renderTasks();
closeModal();
});

function saveTasks() {

localStorage.setItem(
    "taskflowTasks",
    JSON.stringify(tasks)
);
}

function getTodayDate() {

const date = new Date();

const year = date.getFullYear();

const month = String(
    date.getMonth() + 1
).padStart(2, "0");

const day = String(
    date.getDate()
).padStart(2, "0");

return `${year}-${month}-${day}`;
}

function getTaskGroup(task) {

const todayDate = getTodayDate();

if (
    !task.completed &&
    (
        task.priority === "high" ||
        task.deadline === todayDate ||
        (
            task.deadline &&
            task.deadline < todayDate
        )
    )
) {

    return "now";

}


if (
    !task.completed &&
    task.priority === "medium"
) {

    return "next";

}


return "later";

}

function shouldShowTask(task) {

const statusMatches =
    currentStatusFilter === "all" ||

    (
        currentStatusFilter === "active" &&
        !task.completed
    ) ||

    (
        currentStatusFilter === "completed" &&
        task.completed
    );


const priorityMatches =
    priorityFilter.value === "all" ||
    task.priority === priorityFilter.value;


return statusMatches && priorityMatches;

}

function createTaskCard(task) {

const card = document.createElement("article");

card.classList.add("task-card");

if (task.completed) {
    card.classList.add("completed");
}


const formattedDeadline =
    task.deadline

        ? new Date(
            task.deadline + "T00:00:00"
        ).toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        )

        : "No deadline";


card.innerHTML = `

    <div class="task-top">

        <div class="task-title-area">

            <input
                class="task-checkbox"
                type="checkbox"
                ${task.completed ? "checked" : ""}
            >

            <h3>${escapeHTML(task.name)}</h3>

        </div>

    </div>


    <div class="task-meta">

        <span class="task-tag priority-${task.priority}">
            ${task.priority}
        </span>

        <span class="task-tag category-tag">
            ${task.category}
        </span>

    </div>


    <div class="task-info">

        <span>📅 ${formattedDeadline}</span>

        <span>◷ ${task.estimatedTime}</span>

    </div>


    <div class="task-actions">

        <button class="edit-task">
            Edit
        </button>

        <button class="delete-task">
            Delete
        </button>

    </div>

`;


const checkbox =
    card.querySelector(".task-checkbox");

const editButton =
    card.querySelector(".edit-task");

const deleteButton =
    card.querySelector(".delete-task");


checkbox.addEventListener(
    "change",
    function () {

        task.completed =
            checkbox.checked;

        saveTasks();
        renderTasks();

    }
);


deleteButton.addEventListener(
    "click",
    function () {

        tasks = tasks.filter(
            function (currentTask) {

                return currentTask.id !== task.id;

            }
        );

        saveTasks();
        renderTasks();

    }
);


editButton.addEventListener(
    "click",
    function () {

        openEditModal(task);

    }
);


return card;

}


function openEditModal(task) {
editTaskId.value = task.id;

taskName.value = task.name;

taskPriority.value = task.priority;

taskCategory.value = task.category;

taskDeadline.value = task.deadline;

taskTime.value = task.estimatedTime;


modalTitle.textContent = "Edit Task";

saveTaskBtn.textContent = "Save Changes";


openModal();

}


function addEmptyMessage(list, message) {

const emptyMessage =
    document.createElement("div");

emptyMessage.className =
    "empty-state";

emptyMessage.textContent =
    message;

list.appendChild(emptyMessage);

}


function renderTasks() {
doNowList.innerHTML = "";

doNextList.innerHTML = "";

laterList.innerHTML = "";


const visibleTasks =
    tasks.filter(shouldShowTask);


visibleTasks.forEach(
    function (task) {

        const card =
            createTaskCard(task);

        const group =
            getTaskGroup(task);


        if (group === "now") {

            doNowList.appendChild(card);

        }

        else if (group === "next") {

            doNextList.appendChild(card);

        }

        else {

            laterList.appendChild(card);

        }

    }
);


if (
    doNowList.children.length === 0
) {

    addEmptyMessage(
        doNowList,
        "Nothing urgent. Nice."
    );

}


if (
    doNextList.children.length === 0
) {

    addEmptyMessage(
        doNextList,
        "No tasks here yet."
    );

}


if (
    laterList.children.length === 0
) {

    addEmptyMessage(
        laterList,
        "Your future self is chilling."
    );

}


updateStatistics();

}

function updateStatistics() {

const total =
    tasks.length;


const highPriority =
    tasks.filter(
        function (task) {

            return (
                task.priority === "high" &&
                !task.completed
            );

        }
    ).length;


const todayDate =
    getTodayDate();


const dueToday =
    tasks.filter(
        function (task) {

            return (
                task.deadline === todayDate &&
                !task.completed
            );

        }
    ).length;


const completed =
    tasks.filter(
        function (task) {

            return task.completed;

        }
    ).length;


totalTasks.textContent =
    total;

highPriorityTasks.textContent =
    highPriority;

dueTodayTasks.textContent =
    dueToday;

completedTasks.textContent =
    completed;


let percentage = 0;


if (total > 0) {

    percentage =
        Math.round(
            (completed / total) * 100
        );

}


progressBar.style.width =
    percentage + "%";

progressText.textContent =
    percentage + "%";


if (total === 0) {

    progressMessage.textContent =
        "Add your first task to get started.";

}

else if (percentage === 100) {

    progressMessage.textContent =
        "Everything is complete. You cooked. 🔥";

}

else {

    progressMessage.textContent =
        `${completed} of ${total} tasks completed`;

}

}


filterButtons.forEach(
function (button) {
    button.addEventListener(
        "click",
        function () {

            filterButtons.forEach(
                function (currentButton) {

                    currentButton.classList.remove(
                        "active"
                    );

                }
            );


            button.classList.add(
                "active"
            );


            currentStatusFilter =
                button.dataset.filter;


            renderTasks();

        }
    );

}

);

priorityFilter.addEventListener(
"change",
renderTasks
);


themeBtn.addEventListener(
"click",
function () {
    document.body.classList.toggle(
        "dark"
    );


    if (
        document.body.classList.contains(
            "dark"
        )
    ) {

        themeBtn.textContent =
            "☀";

    }

    else {

        themeBtn.textContent =
            "☾";

    }

}

);

function escapeHTML(text) {
const element =
    document.createElement("div");

element.textContent =
    text;

return element.innerHTML;

}

renderTasks();
