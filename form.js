// 1. SUPABASE CONFIGURATION
const _supabase = supabase.createClient(
    'https://choosnjwckopmfunzccb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNob29zbmp3Y2tvcG1mdW56Y2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MzEzOTUsImV4cCI6MjA4NTQwNzM5NX0.tWMtkjpAdUAV0dkU9ICdZariMOxwjtMUItWPrRXBpTU'
);

// 2. STATE VARIABLES
let currentStep = 1;
let selectedTemplate = '';
let profileImageData = '';
let editId = new URLSearchParams(window.location.search).get('edit');

// 3. NAVIGATION LOGIC
function showStep(step) {
    document.querySelectorAll('.form-step').forEach((el, i) => {
        el.classList.toggle('active', i === step - 1);
    });
}

function nextStep() {
    if (currentStep < 4) {
        currentStep++;
        showStep(currentStep);
        if (currentStep === 4) generateResume();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// 4. TEMPLATE & IMAGE SELECTION
function selectTemplate(img, name) {
    document.querySelectorAll('.template img').forEach(el => el.classList.remove('selected'));
    img.classList.add('selected');
    selectedTemplate = name;
}

function previewPicture(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profileImageData = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 5. DYNAMIC FIELD MANAGEMENT (Skills, Education, Work)
function addSkill() {
    const skillSection = document.getElementById("skillsSection");
    const skillEntry = document.createElement("div");
    skillEntry.className = "skill-entry";
    skillEntry.innerHTML = `
        <input type="text" name="skills[]" class="skillInput" placeholder="e.g., Python" />
        <button type="button" onclick="removeSkill(this)">Remove</button>
    `;
    skillSection.appendChild(skillEntry);
}

function removeSkill(button) { button.parentElement.remove(); }

function addEducation() {
    const section = document.getElementById("educationSection");
    const entry = document.createElement("div");
    entry.className = "education-entry";
    entry.innerHTML = `
        <input type="text" class="eduDegree" placeholder="Degree" />
        <input type="text" class="eduInstitution" placeholder="Institution" />
        <input type="text" class="eduYear" placeholder="Year" />
        <button type="button" onclick="removeEducation(this)">Remove</button>
    `;
    section.appendChild(entry);
}

function removeEducation(button) { button.parentElement.remove(); }

function addWork() {
    const section = document.getElementById("workSection");
    const entry = document.createElement("div");
    entry.className = "work-entry";
    entry.innerHTML = `
        <input type="text" class="workPosition" placeholder="Job Title" />
        <input type="text" class="workCompany" placeholder="Company" />
        <input type="text" class="workYear" placeholder="Year" />
        <textarea class="workDesc" placeholder="Description"></textarea>
        <button type="button" onclick="removeWork(this)">Remove</button>
    `;
    section.appendChild(entry);
}

function removeWork(button) { button.parentElement.remove(); }

// 6. RESUME GENERATION & CLOUD SYNC
const textWrapStyles = `white-space: pre-line; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.5;`;

async function syncResumeData() {
    const fullName = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
    
    // Package all form data into one object
    const resumeData = {
        fullName,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        linkedin: document.getElementById('linkedin').value,
        website: document.getElementById('website').value,
        profile: document.getElementById('profile').value,
        gender: document.getElementById('gender').value,
        dob: document.getElementById('dob').value,
        achievements: document.getElementById('achievements').value,
        template: selectedTemplate,
        skills: Array.from(document.querySelectorAll('.skillInput')).map(s => s.value),
        education: Array.from(document.querySelectorAll('.education-entry')).map(e => ({
            degree: e.querySelector('.eduDegree').value,
            institution: e.querySelector('.eduInstitution').value,
            year: e.querySelector('.eduYear').value
        })),
        work: Array.from(document.querySelectorAll('.work-entry')).map(w => ({
            position: w.querySelector('.workPosition').value,
            company: w.querySelector('.workCompany').value,
            year: w.querySelector('.workYear').value,
            description: w.querySelector('.workDesc').value
        }))
    };

    let response;
    if (editId) {
        response = await _supabase.from('resumes').update({ 
            title: fullName, 
            content: JSON.stringify(resumeData) 
        }).eq('id', editId);
    } else {
        response = await _supabase.from('resumes').insert([{ 
            title: fullName, 
            content: JSON.stringify(resumeData) 
        }]);
    }

    if (response.error) {
        alert("Cloud Sync Error: " + response.error.message);
    } else {
        alert("🎉 Success! Resume synced to Cloud.");
        window.location.href = "index.html";
    }
}

// 7. TEMPLATE HTML GENERATORS (Stanford, Harvard, Edinburgh)
function generateResume() {
    const fullName = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const linkedin = document.getElementById('linkedin').value;
    const website = document.getElementById('website').value;
    const profile = document.getElementById('profile').value;
    const gender = document.getElementById('gender').value;
    const dob = document.getElementById('dob').value;
    const achievements = document.getElementById('achievements').value;

    const education = Array.from(document.querySelectorAll('.education-entry')).map(entry => ({
        degree: entry.querySelector('.eduDegree').value,
        institution: entry.querySelector('.eduInstitution').value,
        year: entry.querySelector('.eduYear').value
    }));

    const workExperience = Array.from(document.querySelectorAll('.work-entry')).map(entry => ({
        position: entry.querySelector('.workPosition').value,
        company: entry.querySelector('.workCompany').value,
        year: entry.querySelector('.workYear').value,
        description: entry.querySelector('.workDesc').value
    }));

    const skills = Array.from(document.querySelectorAll('.skillInput')).map(skill => skill.value);

    // Stanford Template Logic
    const generateStanford = () => `
        <style>
            .resume { display: flex; flex-direction: row-reverse; max-width: 1100px; margin: 40px auto; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .sidebar { background-color: #1a3d36; color: white; width: 30%; padding: 40px 20px; box-sizing: border-box; }
            .sidebar img { width: 120px; height: 120px; border-radius: 50%; border: 4px solid #fff; margin: 0 auto 20px; display: block; object-fit: cover;}
            .main { width: 70%; padding: 40px; box-sizing: border-box; }
            .section h2 { color: #1a3d36; border-bottom: 2px solid #1a3d36; padding-bottom: 5px; }
            ${textWrapStyles}
        </style>
        <div class="resume">
            <div class="sidebar">
                ${profileImageData ? `<img src="${profileImageData}">` : ''}
                <h2>Contact</h2>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email}</p>
                <h2>Skills</h2>
                <ul>${skills.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div class="main">
                <h1>${fullName}</h1>
                <div class="section"><h2>Profile</h2><p>${profile}</p></div>
                <div class="section"><h2>Experience</h2>${workExperience.map(w => `<div><h4>${w.position}</h4><p>${w.company} | ${w.year}</p></div>`).join('')}</div>
            </div>
        </div>
    `;

    // (Harvard and Edinburgh templates follow similar structure)
    // Harvard Template Logic
    const generateHarvard = () => `
        <style>
            .container { max-width: 900px; margin: 30px auto; display: flex; background: white; }
            .sidebar { width: 30%; background: #1aa72d; color: #fff; padding: 20px; }
            .main-content { width: 70%; padding: 30px; }
            h1 { color: #008000; }
        </style>
        <div class="container">
            <div class="sidebar">
                ${profileImageData ? `<img style="width:100px; border-radius:50%" src="${profileImageData}">` : ''}
                <h3>PERSONAL</h3>
                <p>Phone: ${phone}</p>
                <p>Email: ${email}</p>
                <h3>SKILLS</h3>
                <ul>${skills.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div class="main-content">
                <h1>Curriculum Vitae</h1>
                <h2>${fullName}</h2>
                <div class="section"><h3>PROFILE</h3><p>${profile}</p></div>
                <div class="section"><h3>EDUCATION</h3>${education.map(e => `<p>${e.degree} - ${e.institution}</p>`).join('')}</div>
            </div>
        </div>
    `;

    // Edinburgh Template Logic
    const generateEdinburgh = () => `
        <style>
            .resume-container { width: 100%; max-width: 800px; margin: auto; background: white; border: 1px solid #ddd; }
            .header { background: #0f172a; color: white; padding: 20px; text-align: center; }
            .main { display: flex; padding: 20px; }
            .left-column { width: 35%; border-right: 1px solid #ddd; padding-right: 10px; }
            .right-column { width: 65%; padding-left: 20px; }
        </style>
        <div class="resume-container">
            <div class="header">
                ${profileImageData ? `<img style="width:80px; border-radius:50%" src="${profileImageData}">` : ''}
                <h1>${fullName}</h1>
            </div>
            <div class="main">
                <div class="left-column">
                    <h3>Contact</h3>
                    <p>${email}</p><p>${phone}</p>
                    <h3>Skills</h3>
                    <ul>${skills.map(s => `<li>${s}</li>`).join('')}</ul>
                </div>
                <div class="right-column">
                    <h3>Objective</h3><p>${profile}</p>
                    <h3>Experience</h3>${workExperience.map(w => `<p><b>${w.position}</b><br>${w.company}</p>`).join('')}
                </div>
            </div>
        </div>
    `;

    let previewHTML = '';
    switch(selectedTemplate) {
        case 'Stanford': previewHTML = generateStanford(); break;
        case 'Harvard': previewHTML = generateHarvard(); break;
        case 'Edinburgh': previewHTML = generateEdinburgh(); break;
        default: previewHTML = `<p style="padding:20px; color:red">Please select a template first!</p>`;
    }
    document.getElementById('resumePreview').innerHTML = previewHTML;
}

// 8. PRINT & DOWNLOAD UTILITIES
async function download() {
    const element = document.getElementById('resumePreview');
    const options = {
        margin: 0.5,
        filename: 'My_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(options).from(element).save();
}

function printResume() {
    window.print();
}