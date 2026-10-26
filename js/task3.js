const takenNames = ['nova reed', 'alex stone', 'mira vale'];
const skillKeys = ['observation', 'craft', 'navigation', 'empathy'];
const skillLabels = ['Observation', 'Craft', 'Navigation', 'Empathy'];

const classRules = {
  explorer: { name: 'Explorer', skill: 'navigation', minimum: 5 },
  engineer: { name: 'Engineer', skill: 'craft', minimum: 6 },
  cartographer: { name: 'Cartographer', skill: 'observation', minimum: 6 }
};

const form = document.querySelector('#character-form');
form.noValidate = true;

const nameInput = document.querySelector('#character-name');
const classInput = document.querySelector('#character-class');
const termsInput = document.querySelector('#character-terms');
const skillInputs = [
  document.querySelector('#skill-observation'),
  document.querySelector('#skill-craft'),
  document.querySelector('#skill-navigation'),
  document.querySelector('#skill-empathy')
];

function getSkillTotal() {
  let total = 0;

  for (const input of skillInputs) {
    total += Number(input.value);
  }

  return total;
}

function showError(input, errorId, message) {
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  document.querySelector(`#${errorId}`).textContent = message;
}

function checkName() {
  const name = nameInput.value.trim();
  let message = '';

  if (name.length < 2) {
    message = 'Enter at least 2 characters.';
  }

  if (takenNames.includes(name.toLowerCase())) {
    message = 'This name is already taken.';
  }

  showError(nameInput, 'name-error', message);
  return message;
}

function checkClass() {
  let message = '';

  if (classInput.value === '') {
    message = 'Choose a class.';
  }

  showError(classInput, 'class-error', message);
  return message;
}

function checkSkills() {
  let message = '';
  const total = getSkillTotal();

  for (const input of skillInputs) {
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > 10) {
      message = 'Each skill must be a whole number from 1 to 10.';
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.setAttribute('aria-invalid', 'false');
    }
  }

  if (message === '' && total !== 20) {
    message = `Skills must total exactly 20 points. Current total: ${total}.`;
  }

  const selectedClass = classRules[classInput.value];

  if (
    message === '' &&
    selectedClass &&
    Number(document.querySelector(`#skill-${selectedClass.skill}`).value) < selectedClass.minimum
  ) {
    message = `${selectedClass.name} needs ${selectedClass.skill} at least ${selectedClass.minimum}.`;
  }

  if (message !== '') {
    for (const input of skillInputs) {
      input.setAttribute('aria-invalid', 'true');
    }
  }

  document.querySelector('#skills-error').textContent = message;
  return message;
}

function checkTerms() {
  let message = '';

  if (termsInput.checked === false) {
    message = 'Accept the safety protocol to continue.';
  }

  showError(termsInput, 'terms-error', message);
  return message;
}

function updatePreview() {
  let name = nameInput.value.trim();

  if (name === '') {
    name = 'Unnamed explorer';
  }

  document.querySelector('#preview-name').textContent = name;
  document.querySelector('#preview-avatar').textContent = name[0].toUpperCase();

  const selectedClass = classRules[classInput.value];

  if (selectedClass) {
    document.querySelector('#preview-class').textContent = selectedClass.name.toUpperCase();
  } else {
    document.querySelector('#preview-class').textContent = 'UNASSIGNED';
  }

  const skillsBox = document.querySelector('#preview-skills');
  skillsBox.replaceChildren();

  for (let i = 0; i < skillInputs.length; i += 1) {
    const skill = document.createElement('div');
    skill.className = 'preview-skill';

    const skillName = document.createElement('span');
    skillName.textContent = skillLabels[i];

    const skillValue = document.createElement('strong');
    skillValue.textContent = skillInputs[i].value;

    skill.append(skillName, skillValue);
    skillsBox.append(skill);
  }

  const total = getSkillTotal();
  document.querySelector('#points-left').textContent = `${20 - total} points left`;

  if (selectedClass && total === 20) {
    document.querySelector('#preview-status').textContent = 'READY';
  } else {
    document.querySelector('#preview-status').textContent = 'DRAFT';
  }
}

function checkAllFields() {
  const errors = [];

  if (checkName() !== '') errors.push('name');
  if (checkClass() !== '') errors.push('class');
  if (checkSkills() !== '') errors.push('skills');
  if (checkTerms() !== '') errors.push('terms');

  return errors;
}

nameInput.addEventListener('input', updatePreview);
nameInput.addEventListener('input', function () {
  if (nameInput.dataset.wasBlurred === 'true') checkName();
});
classInput.addEventListener('change', function () {
  updatePreview();
  if (classInput.dataset.wasBlurred === 'true') checkClass();
  checkSkills();
});
termsInput.addEventListener('change', function () {
  updatePreview();
  if (termsInput.dataset.wasBlurred === 'true') checkTerms();
});

for (const input of skillInputs) {
  input.addEventListener('input', function () {
    updatePreview();
    if (input.dataset.wasBlurred === 'true') checkSkills();
  });
}

nameInput.addEventListener('blur', function () {
  nameInput.dataset.wasBlurred = 'true';
  checkName();
});
classInput.addEventListener('blur', function () {
  classInput.dataset.wasBlurred = 'true';
  checkClass();
});
termsInput.addEventListener('blur', function () {
  termsInput.dataset.wasBlurred = 'true';
  checkTerms();
});

for (const input of skillInputs) {
  input.addEventListener('blur', function () {
    input.dataset.wasBlurred = 'true';
    checkSkills();
  });
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const errors = checkAllFields();
  const formMessage = document.querySelector('#form-errors');

  if (errors.length > 0) {
    formMessage.classList.remove('success-message');
    formMessage.textContent = `${errors.length} issue(s) need attention.`;

    if (errors[0] === 'name') nameInput.focus();
    if (errors[0] === 'class') classInput.focus();
    if (errors[0] === 'skills') skillInputs[0].focus();
    if (errors[0] === 'terms') termsInput.focus();

    return;
  }

  formMessage.classList.add('success-message');
  formMessage.textContent = 'Character created successfully.';
  document.querySelector('#preview-status').textContent = 'CREATED';

  const finalResult = document.querySelector('#final-result');
  const finalResultText = document.querySelector('#final-result-text');
  finalResultText.textContent = `${nameInput.value} the ${classRules[classInput.value].name} was created with ${getSkillTotal()} skill points.`;
  finalResult.classList.remove('hidden');

  form.reset();
  nameInput.removeAttribute('aria-invalid');
  classInput.removeAttribute('aria-invalid');
  termsInput.removeAttribute('aria-invalid');

  for (const input of skillInputs) {
    input.removeAttribute('aria-invalid');
  }

  updatePreview();
});

updatePreview();