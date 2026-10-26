const projects = [
  { id: 1, title: 'Horizon identity', tag: 'brand', status: 'done', priority: 1, value: 42, client: 'Horizon' },
  { id: 2, title: 'Museum wayfinding', tag: 'space', status: 'progress', priority: 2, value: 28, client: 'M+M' },
  { id: 3, title: 'Field notes app', tag: 'digital', status: 'todo', priority: 3, value: 34, client: 'Atlas' },
  { id: 4, title: 'Northstar launch', tag: 'brand', status: 'progress', priority: 1, value: 51, client: 'Northstar' },
  { id: 5, title: 'Quiet objects', tag: 'space', status: 'todo', priority: 2, value: 19, client: 'Form' },
  { id: 6, title: 'Tide dashboard', tag: 'digital', status: 'done', priority: 2, value: 36, client: 'Tide' },
  { id: 7, title: 'Common ground', tag: 'brand', status: 'todo', priority: 3, value: 24, client: 'Common' },
  { id: 8, title: 'Transit atlas', tag: 'digital', status: 'progress', priority: 1, value: 47, client: 'Metro' },
  { id: 9, title: 'Archive room', tag: 'space', status: 'done', priority: 3, value: 31, client: 'Archive' },
  { id: 10, title: 'Signal system', tag: 'digital', status: 'todo', priority: 2, value: 26, client: 'Signal' }
];

let searchText = '';
let selectedTag = 'all';

const boardElement = document.querySelector('#kanban-board');
const searchElement = document.querySelector('#board-search');
const filtersElement = document.querySelector('#tag-filters');
const emptyElement = document.querySelector('#board-empty');
const progressElement = document.querySelector('#board-progress');
const boardMessage = document.querySelector('#board-message');

const columnNames = [
  { key: 'todo', title: 'To do' },
  { key: 'progress', title: 'In progress' },
  { key: 'done', title: 'Done' }
];

function getVisibleProjects() {
  const visibleProjects = [];
  const text = searchText.toLowerCase();

  for (const project of projects) {
    const projectText = `${project.title} ${project.client} ${project.tag}`.toLowerCase();
    const matchesText = projectText.indexOf(text) !== -1;
    const matchesTag = selectedTag === 'all' || selectedTag === project.tag;

    if (matchesText && matchesTag) {
      visibleProjects.push(project);
    }
  }

  return visibleProjects;
}

function getCompletedValue() {
  let total = 0;

  for (const project of projects) {
    if (project.status === 'done') {
      total += project.value;
    }
  }

  return total;
}

function createProjectCard(project) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.dataset.id = project.id;

  const top = document.createElement('div');
  top.className = 'card-top';

  const tag = document.createElement('span');
  tag.textContent = project.tag;

  const priority = document.createElement('span');
  priority.className = 'priority';
  priority.textContent = '★'.repeat(4 - project.priority);

  top.append(tag, priority);

  const title = document.createElement('h4');
  title.textContent = project.title;

  const bottom = document.createElement('div');
  bottom.className = 'card-bottom';

  const details = document.createElement('span');
  details.textContent = `${project.client} / $${project.value}k`;

  const moveButton = document.createElement('button');
  moveButton.className = 'card-action';
  moveButton.dataset.action = 'move';
  moveButton.textContent = '→';
  moveButton.setAttribute('aria-label', `Move ${project.title} to next stage`);

  bottom.append(details, moveButton);
  card.append(top, title, bottom);

  return card;
}

function createColumn(column, visibleProjects) {
  const section = document.createElement('section');
  section.className = 'kanban-column';

  const heading = document.createElement('div');
  heading.className = 'column-heading';

  const title = document.createElement('h3');
  title.textContent = column.title;

  const count = document.createElement('span');
  count.className = 'column-count';

  let cardsInColumn = 0;

  for (const project of visibleProjects) {
    if (project.status === column.key) {
      cardsInColumn += 1;
    }
  }

  count.textContent = cardsInColumn;
  heading.append(title, count);
  section.append(heading);

  const columnProjects = [];

  for (const project of visibleProjects) {
    if (project.status === column.key) {
      columnProjects.push(project);
    }
  }

  columnProjects.sort(function (firstProject, secondProject) {
    return firstProject.priority - secondProject.priority;
  });

  for (const project of columnProjects) {
    section.append(createProjectCard(project));
  }

  return section;
}

function renderBoard() {
  const visibleProjects = getVisibleProjects();
  boardElement.replaceChildren();

  for (const column of columnNames) {
    boardElement.append(createColumn(column, visibleProjects));
  }

  let completedCount = 0;
  let progressCount = 0;

  for (const project of projects) {
    if (project.status === 'done') {
      completedCount += 1;
    }
    if (project.status === 'progress') {
      progressCount += 1;
    }
  }

  document.querySelector('#board-summary').textContent = `${visibleProjects.length} visible / ${progressCount} in progress`;
  document.querySelector('#board-total').textContent = `Completed value: $${getCompletedValue()}k`;
  progressElement.className = `progress-${completedCount}`;
  emptyElement.classList.toggle('hidden', visibleProjects.length !== 0);
}

function moveProject(projectId) {
  for (const project of projects) {
    if (project.id === projectId) {
      if (project.status === 'todo') {
        let progressCards = 0;

        for (const item of projects) {
          if (item.status === 'progress') {
            progressCards += 1;
          }
        }

        if (progressCards >= 3) {
          boardMessage.textContent = 'Move blocked: In progress can contain only 3 cards.';
          return;
        }

        project.status = 'progress';
      } else if (project.status === 'progress') {
        project.status = 'done';
      } else {
        project.status = 'todo';
      }

      boardMessage.textContent = '';
    }
  }

  renderBoard();
}

boardElement.addEventListener('click', function (event) {
  const button = event.target.closest('[data-action]');

  if (!button) {
    return;
  }

  const card = button.closest('[data-id]');
  moveProject(Number(card.dataset.id));
});

searchElement.addEventListener('input', function () {
  searchText = searchElement.value;
  renderBoard();
});

filtersElement.addEventListener('click', function (event) {
  const button = event.target.closest('[data-tag]');

  if (!button) {
    return;
  }

  selectedTag = button.dataset.tag;

  const allButtons = document.querySelectorAll('.filter-button');
  for (const filterButton of allButtons) {
    filterButton.classList.toggle('active', filterButton === button);
  }

  renderBoard();
});

renderBoard();