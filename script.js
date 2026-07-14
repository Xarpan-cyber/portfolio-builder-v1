// ============================================
// STATE MANAGEMENT
// ============================================
let portfolioData = {
    personal: {
        firstName: '',
        lastName: '',
        title: '',
        bio: '',
        photo: ''
    },
    skills: [],
    education: [],
    projects: [],
    contact: {
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        twitter: '',
        instagram: ''
    }
};

let currentSection = 0;
let currentTheme = 'default';
let modalCallback = null;
let educationCounter = 0;
let projectCounter = 0;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    loadFromLocalStorage();
    populateFormsFromData();
    updateProgress();
});

// ============================================
// NAVIGATION
// ============================================
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target page
    document.getElementById('page-' + page).classList.add('active');

    // Update nav links
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.nav-links a[data-page="${page}"]`).classList.add('active');

    // Close mobile menu
    document.getElementById('navLinks').classList.remove('active');
    document.getElementById('hamburger').classList.remove('active');

    // If navigating to preview, refresh it
    if (page === 'preview') {
        renderPortfolioPreview();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return false;
}

function toggleMobileMenu() {
    document.getElementById('navLinks').classList.toggle('active');
    document.getElementById('hamburger').classList.toggle('active');
}

// ============================================
// FORM SECTION NAVIGATION
// ============================================
function showFormSection(index) {
    saveCurrentSection();

    currentSection = index;

    // Hide all sections
    document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
    document.getElementById('section-' + index).classList.add('active');

    // Update nav
    document.querySelectorAll('.form-nav li').forEach((li, i) => {
        li.classList.remove('active');
        if (i === index) li.classList.add('active');
    });

    updateProgress();
}

function nextSection() {
    saveCurrentSection();

    if (currentSection === 0) {
        // Validate personal details
        if (!validatePersonalDetails()) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
    }

    if (currentSection < 4) {
        showFormSection(currentSection + 1);
    }
}

function prevSection() {
    saveCurrentSection();
    if (currentSection > 0) {
        showFormSection(currentSection - 1);
    }
}

// ============================================
// VALIDATION (Member 1)
// ============================================
function validateField(input, type) {
    const errorEl = document.getElementById('error-' + input.id);
    let isValid = true;

    switch (type) {
        case 'text':
            isValid = input.value.trim().length > 0;
            break;
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = input.value.trim() === '' || emailRegex.test(input.value.trim());
            if (input.id === 'email') {
                isValid = emailRegex.test(input.value.trim());
            }
            break;
        case 'phone':
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
            isValid = input.value.trim() === '' || phoneRegex.test(input.value.trim());
            break;
        case 'url':
            const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
            isValid = input.value.trim() === '' || urlRegex.test(input.value.trim());
            break;
    }

    if (isValid) {
        input.classList.remove('error');
        if (input.value.trim().length > 0) input.classList.add('valid');
        else input.classList.remove('valid');
        if (errorEl) errorEl.classList.remove('show');
    } else {
        input.classList.add('error');
        input.classList.remove('valid');
        if (errorEl) errorEl.classList.add('show');
    }

    autoSave();
    return isValid;
}

function validatePersonalDetails() {
    let isValid = true;

    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const title = document.getElementById('title');

    if (!validateField(firstName, 'text')) isValid = false;
    if (!validateField(lastName, 'text')) isValid = false;
    if (!validateField(title, 'text')) isValid = false;

    return isValid;
}

function validateContactDetails() {
    let isValid = true;
    const email = document.getElementById('email');
    if (!validateField(email, 'email')) isValid = false;
    return isValid;
}

// ============================================
// PHOTO UPLOAD
// ============================================
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('photoPreview');
            const placeholder = document.getElementById('uploadPlaceholder');
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            portfolioData.personal.photo = e.target.result;
            autoSave();
            showToast('Photo uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// ============================================
// SKILLS MANAGEMENT
// ============================================
function addSkill() {
    const input = document.getElementById('skillInput');
    const levelSelect = document.getElementById('skillLevel');
    const skillName = input.value.trim();

    if (!skillName) {
        showToast('Please enter a skill name', 'warning');
        input.focus();
        return;
    }

    // Check for duplicate
    if (portfolioData.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase())) {
        showToast('This skill already exists', 'warning');
        return;
    }

    const skill = {
        name: skillName,
        level: parseInt(levelSelect.value),
        levelName: levelSelect.options[levelSelect.selectedIndex].text
    };

    portfolioData.skills.push(skill);
    renderSkills();
    input.value = '';
    input.focus();
    autoSave();
    showToast(`"${skillName}" added!`, 'success');
}

function removeSkill(index) {
    const skillName = portfolioData.skills[index].name;
    portfolioData.skills.splice(index, 1);
    renderSkills();
    autoSave();
    showToast(`"${skillName}" removed`, 'success');
}

function renderSkills() {
    const container = document.getElementById('skillsContainer');
    container.innerHTML = '';

    portfolioData.skills.forEach((skill, index) => {
        const tag = document.createElement('div');
        tag.className = 'skill-tag';
        tag.innerHTML = `
            ${skill.name} <span style="font-size: 0.75rem; opacity: 0.7;">(${skill.levelName})</span>
            <span class="remove-skill" onclick="removeSkill(${index})">✕</span>
        `;
        container.appendChild(tag);
    });

    updateProgress();
}

// ============================================
// EDUCATION MANAGEMENT (Member 3)
// ============================================
function addEducation() {
    educationCounter++;
    const id = educationCounter;

    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.id = 'edu-' + id;
    item.innerHTML = `
        <div class="item-header">
            <span class="item-title">🎓 Education #${portfolioData.education.length + 1}</span>
            <button class="remove-item-btn" onclick="removeEducation(${id})" title="Remove">✕</button>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>Degree / Certificate <span class="required">*</span></label>
                <input type="text" id="eduDegree-${id}" placeholder="B.Sc. Computer Science" oninput="autoSave()">
            </div>
            <div class="form-group">
                <label>Institution <span class="required">*</span></label>
                <input type="text" id="eduInstitution-${id}" placeholder="MIT" oninput="autoSave()">
            </div>
            <div class="form-group">
                <label>Start Year</label>
                <input type="text" id="eduStart-${id}" placeholder="2018" oninput="autoSave()">
            </div>
            <div class="form-group">
                <label>End Year</label>
                <input type="text" id="eduEnd-${id}" placeholder="2022 or Present" oninput="autoSave()">
            </div>
            <div class="form-group">
                <label>Grade / GPA</label>
                <input type="text" id="eduGrade-${id}" placeholder="3.8/4.0" oninput="autoSave()">
            </div>
            <div class="form-group full-width">
                <label>Description</label>
                <textarea id="eduDesc-${id}" placeholder="Brief description of your studies, achievements, etc." rows="2" oninput="autoSave()"></textarea>
            </div>
        </div>
    `;

    document.getElementById('educationList').appendChild(item);

    portfolioData.education.push({
        id: id,
        degree: '',
        institution: '',
        startYear: '',
        endYear: '',
        grade: '',
        description: ''
    });

    updateProgress();
}

function removeEducation(id) {
    const element = document.getElementById('edu-' + id);
    if (element) {
        element.style.animation = 'fadeIn 0.3s reverse';
        setTimeout(() => {
            element.remove();
            portfolioData.education = portfolioData.education.filter(e => e.id !== id);
            autoSave();
            updateProgress();
        }, 300);
    }
}

function collectEducationData() {
    portfolioData.education.forEach(edu => {
        const degreeEl = document.getElementById('eduDegree-' + edu.id);
        if (degreeEl) {
            edu.degree = degreeEl.value.trim();
            edu.institution = document.getElementById('eduInstitution-' + edu.id).value.trim();
            edu.startYear = document.getElementById('eduStart-' + edu.id).value.trim();
            edu.endYear = document.getElementById('eduEnd-' + edu.id).value.trim();
            edu.grade = document.getElementById('eduGrade-' + edu.id).value.trim();
            edu.description = document.getElementById('eduDesc-' + edu.id).value.trim();
        }
    });
}

// ============================================
// PROJECTS MANAGEMENT (Member 3)
// ============================================
function addProject() {
    projectCounter++;
    const id = projectCounter;

    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.id = 'proj-' + id;
    item.innerHTML = `
        <div class="item-header">
            <span class="item-title">💼 Project #${portfolioData.projects.length + 1}</span>
            <button class="remove-item-btn" onclick="removeProject(${id})" title="Remove">✕</button>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>Project Name <span class="required">*</span></label>
                <input type="text" id="projName-${id}" placeholder="My Awesome Project" oninput="autoSave()">
            </div>
            <div class="form-group">
                <label>Technologies Used</label>
                <input type="text" id="projTech-${id}" placeholder="HTML, CSS, JavaScript (comma separated)" oninput="autoSave()">
            </div>
            <div class="form-group full-width">
                <label>Description <span class="required">*</span></label>
                <textarea id="projDesc-${id}" placeholder="Describe what this project does, the problem it solves, and your role..." rows="3" oninput="autoSave()"></textarea>
            </div>
            <div class="form-group">
                <label>Live Demo URL</label>
                <input type="url" id="projLive-${id}" placeholder="https://myproject.com" oninput="autoSave()">
            </div>
            <div class="form-group">
                <label>Source Code URL</label>
                <input type="url" id="projCode-${id}" placeholder="https://github.com/user/project" oninput="autoSave()">
            </div>
        </div>
    `;

    document.getElementById('projectsList').appendChild(item);

    portfolioData.projects.push({
        id: id,
        name: '',
        technologies: '',
        description: '',
        liveUrl: '',
        codeUrl: ''
    });

    updateProgress();
}

function removeProject(id) {
    const element = document.getElementById('proj-' + id);
    if (element) {
        element.style.animation = 'fadeIn 0.3s reverse';
        setTimeout(() => {
            element.remove();
            portfolioData.projects = portfolioData.projects.filter(p => p.id !== id);
            autoSave();
            updateProgress();
        }, 300);
    }
}

function collectProjectData() {
    portfolioData.projects.forEach(proj => {
        const nameEl = document.getElementById('projName-' + proj.id);
        if (nameEl) {
            proj.name = nameEl.value.trim();
            proj.technologies = document.getElementById('projTech-' + proj.id).value.trim();
            proj.description = document.getElementById('projDesc-' + proj.id).value.trim();
            proj.liveUrl = document.getElementById('projLive-' + proj.id).value.trim();
            proj.codeUrl = document.getElementById('projCode-' + proj.id).value.trim();
        }
    });
}

// ============================================
// SAVE & COLLECT DATA
// ============================================
function saveCurrentSection() {
    // Personal
    portfolioData.personal.firstName = document.getElementById('firstName').value.trim();
    portfolioData.personal.lastName = document.getElementById('lastName').value.trim();
    portfolioData.personal.title = document.getElementById('title').value.trim();
    portfolioData.personal.bio = document.getElementById('bio').value.trim();

    // Contact
    portfolioData.contact.email = document.getElementById('email').value.trim();
    portfolioData.contact.phone = document.getElementById('phone').value.trim();
    portfolioData.contact.location = document.getElementById('location').value.trim();
    portfolioData.contact.website = document.getElementById('website').value.trim();
    portfolioData.contact.linkedin = document.getElementById('linkedin').value.trim();
    portfolioData.contact.github = document.getElementById('github').value.trim();
    portfolioData.contact.twitter = document.getElementById('twitter').value.trim();
    portfolioData.contact.instagram = document.getElementById('instagram').value.trim();

    // Education & Projects
    collectEducationData();
    collectProjectData();
}

function autoSave() {
    saveCurrentSection();
    saveToLocalStorage();
    updateProgress();
}

// ============================================
// PROGRESS TRACKING
// ============================================
function updateProgress() {
    let completedSteps = 0;
    const navItems = document.querySelectorAll('.form-nav li');

    // Check personal
    if (portfolioData.personal.firstName && portfolioData.personal.lastName && portfolioData.personal.title) {
        completedSteps++;
        navItems[0].classList.add('completed');
    } else {
        navItems[0].classList.remove('completed');
    }

    // Check skills
    if (portfolioData.skills.length > 0) {
        completedSteps++;
        navItems[1].classList.add('completed');
    } else {
        navItems[1].classList.remove('completed');
    }

    // Check education
    if (portfolioData.education.length > 0) {
        completedSteps++;
        navItems[2].classList.add('completed');
    } else {
        navItems[2].classList.remove('completed');
    }

    // Check projects
    if (portfolioData.projects.length > 0) {
        completedSteps++;
        navItems[3].classList.add('completed');
    } else {
        navItems[3].classList.remove('completed');
    }

    // Check contact
    if (portfolioData.contact.email) {
        completedSteps++;
        navItems[4].classList.add('completed');
    } else {
        navItems[4].classList.remove('completed');
    }

    const percent = Math.round((completedSteps / 5) * 100);
    document.getElementById('progressPercent').textContent = percent + '%';
    document.getElementById('progressFill').style.width = percent + '%';
}

// ============================================
// GENERATE PORTFOLIO (Member 2 - Layout)
// ============================================
function generatePortfolio() {
    saveCurrentSection();

    // Validate required fields
    if (!portfolioData.personal.firstName || !portfolioData.personal.lastName || !portfolioData.personal.title) {
        showToast('Please fill in all required personal details (First Name, Last Name, Title)', 'error');
        showFormSection(0);
        return;
    }

    if (!portfolioData.contact.email) {
        showToast('Please add your email address', 'error');
        showFormSection(4);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(portfolioData.contact.email)) {
        showToast('Please enter a valid email address', 'error');
        showFormSection(4);
        return;
    }

    saveToLocalStorage();
    navigateTo('preview');
    showToast('Portfolio generated successfully! 🎉', 'success');
}

function renderPortfolioPreview() {
    const container = document.getElementById('portfolioContent');
    const data = portfolioData;

    // Check if we have data
    if (!data.personal.firstName && !data.personal.lastName) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h2>No Portfolio Yet</h2>
                <p>Start building your portfolio by filling in your details in the Builder section.</p>
                <button class="btn btn-primary" onclick="navigateTo('builder')">🛠️ Go to Builder</button>
            </div>
        `;
        return;
    }

    const fullName = `${data.personal.firstName} ${data.personal.lastName}`;
    const initials = `${(data.personal.firstName[0] || '').toUpperCase()}${(data.personal.lastName[0] || '').toUpperCase()}`;

    let html = '';

    // Actions bar
    html += `
        <div class="portfolio-actions">
            <button class="btn btn-primary" onclick="navigateTo('builder')">✏️ Edit Portfolio</button>
            <button class="btn btn-secondary" onclick="printPortfolio()">🖨️ Print / PDF</button>
            <button class="btn btn-secondary" onclick="navigateTo('themes')">🎨 Change Theme</button>
        </div>
    `;

    // Portfolio container
    html += '<div class="portfolio-preview">';

    // Hero Section
    html += `<div class="portfolio-hero">`;
    if (data.personal.photo) {
        html += `<img src="${data.personal.photo}" alt="${fullName}" class="portfolio-avatar">`;
    } else {
        html += `<div class="portfolio-avatar-placeholder">${initials}</div>`;
    }
    html += `<h1>${fullName}</h1>`;
    html += `<p class="tagline">${data.personal.title}</p>`;
    if (data.personal.bio) {
        html += `<p class="bio">${data.personal.bio}</p>`;
    }

    // Social links in hero
    let socialLinks = '';
    if (data.contact.github) socialLinks += `<a href="${data.contact.github}" target="_blank">💻 GitHub</a>`;
    if (data.contact.linkedin) socialLinks += `<a href="${data.contact.linkedin}" target="_blank">💼 LinkedIn</a>`;
    if (data.contact.twitter) socialLinks += `<a href="${data.contact.twitter}" target="_blank">🐦 Twitter</a>`;
    if (data.contact.website) socialLinks += `<a href="${data.contact.website}" target="_blank">🌐 Website</a>`;
    if (data.contact.instagram) socialLinks += `<a href="${data.contact.instagram}" target="_blank">📸 Instagram</a>`;

    if (socialLinks) {
        html += `<div class="social-links">${socialLinks}</div>`;
    }
    html += `</div>`;

    // Skills Section
    if (data.skills.length > 0) {
        html += `<div class="portfolio-section">`;
        html += `<div class="portfolio-section-title">🎯 Skills & Expertise</div>`;
        html += `<div class="skills-grid">`;
        data.skills.forEach(skill => {
            html += `
                <div class="skill-display-item">
                    <div class="skill-name">
                        <span>${skill.name}</span>
                        <span class="skill-level">${skill.levelName}</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-bar-fill" style="width: ${skill.level}%"></div>
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
    }

    // Education Section
    const validEducation = data.education.filter(e => e.degree || e.institution);
    if (validEducation.length > 0) {
        html += `<div class="portfolio-section">`;
        html += `<div class="portfolio-section-title">🎓 Education</div>`;
        html += `<div class="education-timeline">`;
        validEducation.forEach(edu => {
            html += `<div class="education-item">`;
            html += `<h3>${edu.degree || 'Untitled Degree'}</h3>`;
            if (edu.institution) html += `<p class="institution">${edu.institution}</p>`;
            html += `<div class="edu-details">`;
            if (edu.startYear || edu.endYear) {
                html += `<span>📅 ${edu.startYear || '?'} - ${edu.endYear || 'Present'}</span>`;
            }
            if (edu.grade) html += `<span>📊 GPA: ${edu.grade}</span>`;
            html += `</div>`;
            if (edu.description) html += `<p style="margin-top: 8px; color: var(--text-secondary); font-size: 0.95rem;">${edu.description}</p>`;
            html += `</div>`;
        });
        html += `</div></div>`;
    }

    // Projects Section
    const validProjects = data.projects.filter(p => p.name || p.description);
    if (validProjects.length > 0) {
        html += `<div class="portfolio-section">`;
        html += `<div class="portfolio-section-title">💼 Projects</div>`;
        html += `<div class="projects-grid">`;
        validProjects.forEach(proj => {
            html += `<div class="project-card">`;
            html += `<div class="project-card-header">`;
            html += `<h3>${proj.name || 'Untitled Project'}</h3>`;
            html += `</div>`;
            html += `<div class="project-card-body">`;
            if (proj.description) html += `<p>${proj.description}</p>`;
            if (proj.technologies) {
                html += `<div class="project-tech">`;
                proj.technologies.split(',').forEach(tech => {
                    tech = tech.trim();
                    if (tech) html += `<span>${tech}</span>`;
                });
                html += `</div>`;
            }
            if (proj.liveUrl || proj.codeUrl) {
                html += `<div class="project-links">`;
                if (proj.liveUrl) html += `<a href="${proj.liveUrl}" target="_blank" class="live-link">🔗 Live Demo</a>`;
                if (proj.codeUrl) html += `<a href="${proj.codeUrl}" target="_blank" class="code-link">📂 Source Code</a>`;
                html += `</div>`;
            }
            html += `</div></div>`;
        });
        html += `</div></div>`;
    }

    // Contact Section
    html += `<div class="portfolio-section">`;
    html += `<div class="portfolio-section-title">📬 Get In Touch</div>`;
    html += `<div class="contact-grid">`;

    if (data.contact.email) {
        html += `
            <div class="contact-item">
                <div class="contact-icon">📧</div>
                <div class="contact-info">
                    <h4>Email</h4>
                    <a href="mailto:${data.contact.email}">${data.contact.email}</a>
                </div>
            </div>
        `;
    }
    if (data.contact.phone) {
        html += `
            <div class="contact-item">
                <div class="contact-icon">📱</div>
                <div class="contact-info">
                    <h4>Phone</h4>
                    <a href="tel:${data.contact.phone}">${data.contact.phone}</a>
                </div>
            </div>
        `;
    }
    if (data.contact.location) {
        html += `
            <div class="contact-item">
                <div class="contact-icon">📍</div>
                <div class="contact-info">
                    <h4>Location</h4>
                    <p>${data.contact.location}</p>
                </div>
            </div>
        `;
    }
    if (data.contact.website) {
        html += `
            <div class="contact-item">
                <div class="contact-icon">🌐</div>
                <div class="contact-info">
                    <h4>Website</h4>
                    <a href="${data.contact.website}" target="_blank">${data.contact.website}</a>
                </div>
            </div>
        `;
    }
    if (data.contact.linkedin) {
        html += `
            <div class="contact-item">
                <div class="contact-icon">💼</div>
                <div class="contact-info">
                    <h4>LinkedIn</h4>
                    <a href="${data.contact.linkedin}" target="_blank">View Profile</a>
                </div>
            </div>
        `;
    }
    if (data.contact.github) {
        html += `
            <div class="contact-item">
                <div class="contact-icon">💻</div>
                <div class="contact-info">
                    <h4>GitHub</h4>
                    <a href="${data.contact.github}" target="_blank">View Profile</a>
                </div>
            </div>
        `;
    }
    if (data.contact.twitter) {
        html += `
            <div class="contact-item">
                <div class="contact-icon">🐦</div>
                <div class="contact-info">
                    <h4>Twitter / X</h4>
                    <a href="${data.contact.twitter}" target="_blank">View Profile</a>
                </div>
            </div>
        `;
    }
    if (data.contact.instagram) {
        html += `
            <div class="contact-item">
                <div class="contact-icon">📸</div>
                <div class="contact-info">
                    <h4>Instagram</h4>
                    <a href="${data.contact.instagram}" target="_blank">View Profile</a>
                </div>
            </div>
        `;
    }

    html += `</div></div>`;

    html += '</div>'; // Close portfolio-preview

    container.innerHTML = html;
}

function printPortfolio() {
    window.print();
}

// ============================================
// THEMES (Member 4)
// ============================================
function setTheme(theme) {
    currentTheme = theme;

    // Apply theme
    if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Update theme cards
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-theme-card="${theme}"]`).classList.add('active');

    // Save to local storage
    localStorage.setItem('portfolio-theme', theme);

    showToast('Theme updated!', 'success');
}

// ============================================
// LOCAL STORAGE (Member 4)
// ============================================
function saveToLocalStorage() {
    try {
        localStorage.setItem('portfolio-data', JSON.stringify(portfolioData));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        // Load data
        const savedData = localStorage.getItem('portfolio-data');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            // Merge with default structure to handle missing fields
            portfolioData = {
                personal: { ...portfolioData.personal, ...parsed.personal },
                skills: parsed.skills || [],
                education: parsed.education || [],
                projects: parsed.projects || [],
                contact: { ...portfolioData.contact, ...parsed.contact }
            };
        }

        // Load theme
        const savedTheme = localStorage.getItem('portfolio-theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
}

function populateFormsFromData() {
    // Personal
    document.getElementById('firstName').value = portfolioData.personal.firstName || '';
    document.getElementById('lastName').value = portfolioData.personal.lastName || '';
    document.getElementById('title').value = portfolioData.personal.title || '';
    document.getElementById('bio').value = portfolioData.personal.bio || '';

    // Photo
    if (portfolioData.personal.photo) {
        const preview = document.getElementById('photoPreview');
        const placeholder = document.getElementById('uploadPlaceholder');
        preview.src = portfolioData.personal.photo;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
    }

    // Skills
    renderSkills();

    // Education
    portfolioData.education.forEach(edu => {
        const id = edu.id;
        if (id > educationCounter) educationCounter = id;

        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.id = 'edu-' + id;
        item.innerHTML = `
            <div class="item-header">
                <span class="item-title">🎓 Education</span>
                <button class="remove-item-btn" onclick="removeEducation(${id})" title="Remove">✕</button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Degree / Certificate <span class="required">*</span></label>
                    <input type="text" id="eduDegree-${id}" value="${edu.degree || ''}" placeholder="B.Sc. Computer Science" oninput="autoSave()">
                </div>
                <div class="form-group">
                    <label>Institution <span class="required">*</span></label>
                    <input type="text" id="eduInstitution-${id}" value="${edu.institution || ''}" placeholder="MIT" oninput="autoSave()">
                </div>
                <div class="form-group">
                    <label>Start Year</label>
                    <input type="text" id="eduStart-${id}" value="${edu.startYear || ''}" placeholder="2018" oninput="autoSave()">
                </div>
                <div class="form-group">
                    <label>End Year</label>
                    <input type="text" id="eduEnd-${id}" value="${edu.endYear || ''}" placeholder="2022 or Present" oninput="autoSave()">
                </div>
                <div class="form-group">
                    <label>Grade / GPA</label>
                    <input type="text" id="eduGrade-${id}" value="${edu.grade || ''}" placeholder="3.8/4.0" oninput="autoSave()">
                </div>
                <div class="form-group full-width">
                    <label>Description</label>
                    <textarea id="eduDesc-${id}" placeholder="Brief description..." rows="2" oninput="autoSave()">${edu.description || ''}</textarea>
                </div>
            </div>
        `;
        document.getElementById('educationList').appendChild(item);
    });

    // Projects
    portfolioData.projects.forEach(proj => {
        const id = proj.id;
        if (id > projectCounter) projectCounter = id;

        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.id = 'proj-' + id;
        item.innerHTML = `
            <div class="item-header">
                <span class="item-title">💼 Project</span>
                <button class="remove-item-btn" onclick="removeProject(${id})" title="Remove">✕</button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Project Name <span class="required">*</span></label>
                    <input type="text" id="projName-${id}" value="${proj.name || ''}" placeholder="My Awesome Project" oninput="autoSave()">
                </div>
                <div class="form-group">
                    <label>Technologies Used</label>
                    <input type="text" id="projTech-${id}" value="${proj.technologies || ''}" placeholder="HTML, CSS, JavaScript" oninput="autoSave()">
                </div>
                <div class="form-group full-width">
                    <label>Description <span class="required">*</span></label>
                    <textarea id="projDesc-${id}" placeholder="Describe the project..." rows="3" oninput="autoSave()">${proj.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Live Demo URL</label>
                    <input type="url" id="projLive-${id}" value="${proj.liveUrl || ''}" placeholder="https://myproject.com" oninput="autoSave()">
                </div>
                <div class="form-group">
                    <label>Source Code URL</label>
                    <input type="url" id="projCode-${id}" value="${proj.codeUrl || ''}" placeholder="https://github.com/user/project" oninput="autoSave()">
                </div>
            </div>
        `;
        document.getElementById('projectsList').appendChild(item);
    });

    // Contact
    document.getElementById('email').value = portfolioData.contact.email || '';
    document.getElementById('phone').value = portfolioData.contact.phone || '';
    document.getElementById('location').value = portfolioData.contact.location || '';
    document.getElementById('website').value = portfolioData.contact.website || '';
    document.getElementById('linkedin').value = portfolioData.contact.linkedin || '';
    document.getElementById('github').value = portfolioData.contact.github || '';
    document.getElementById('twitter').value = portfolioData.contact.twitter || '';
    document.getElementById('instagram').value = portfolioData.contact.instagram || '';

    updateProgress();
}

// ============================================
// RESET
// ============================================
function showResetModal() {
    document.getElementById('modalTitle').textContent = '🗑️ Reset All Data';
    document.getElementById('modalMessage').textContent = 'Are you sure you want to delete all your portfolio data? This action cannot be undone.';
    document.getElementById('modalConfirmBtn').textContent = 'Reset Everything';
    modalCallback = resetAllData;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    modalCallback = null;
}

function confirmModal() {
    if (modalCallback) {
        modalCallback();
    }
    closeModal();
}

function resetAllData() {
    // Reset data
    portfolioData = {
        personal: { firstName: '', lastName: '', title: '', bio: '', photo: '' },
        skills: [],
        education: [],
        projects: [],
        contact: { email: '', phone: '', location: '', website: '', linkedin: '', github: '', twitter: '', instagram: '' }
    };

    // Clear local storage
    localStorage.removeItem('portfolio-data');

    // Reset form fields
    document.querySelectorAll('input, textarea').forEach(el => {
        if (el.type !== 'file') el.value = '';
        el.classList.remove('error', 'valid');
    });

    // Reset photo
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('uploadPlaceholder').style.display = 'block';

    // Clear dynamic lists
    document.getElementById('skillsContainer').innerHTML = '';
    document.getElementById('educationList').innerHTML = '';
    document.getElementById('projectsList').innerHTML = '';

    // Reset errors
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));

    // Reset counters
    educationCounter = 0;
    projectCounter = 0;

    // Reset to first section
    showFormSection(0);
    updateProgress();

    showToast('All data has been reset', 'success');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '';
    switch (type) {
        case 'success': icon = '✅'; break;
        case 'error': icon = '❌'; break;
        case 'warning': icon = '⚠️'; break;
    }

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.4s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}

// ============================================
// CLOSE MOBILE MENU ON OUTSIDE CLICK
// ============================================
document.addEventListener('click', function (e) {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');

    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Close modal on overlay click
document.getElementById('modalOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});