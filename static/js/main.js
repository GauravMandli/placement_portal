/* ============================================
   Online Placement Management System - Main JS
   ============================================ */

// Sidebar UX: fixed on desktop, collapsible on mobile, overlay, logout at bottom
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('sidebar-open');
        if (overlay) {
            overlay.classList.add('show');
            overlay.setAttribute('aria-hidden', 'false');
        }
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('sidebar-open');
        if (overlay) {
            overlay.classList.remove('show');
            overlay.setAttribute('aria-hidden', 'true');
        }
        document.body.style.overflow = '';
        var toggle = document.querySelector('.mobile-menu-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    function isMobile() {
        return window.innerWidth <= 768;
    }

    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.setAttribute('aria-controls', 'sidebar');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (sidebar.classList.contains('sidebar-open')) {
                closeSidebar();
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            } else {
                openSidebar();
                mobileMenuToggle.setAttribute('aria-expanded', 'true');
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar when clicking a nav link (in-page) on mobile
    document.querySelectorAll('.sidebar-nav .nav-link-dashboard').forEach(function(link) {
        link.addEventListener('click', function() {
            if (isMobile()) closeSidebar();
        });
    });

    // Close sidebar on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('sidebar-open')) {
            closeSidebar();
        }
    });

    // Close on resize to desktop (optional)
    window.addEventListener('resize', function() {
        if (!isMobile() && sidebar && sidebar.classList.contains('sidebar-open')) {
            closeSidebar();
        }
    });

    // Set active menu item based on current page (for multi-page dashboards)
    // setActiveMenuItem();

    // Floating labels: toggle .filled when input has value (for form-group-floating)
    function updateFloatingLabel(wrapper) {
        var input = wrapper.querySelector('.form-control, .form-select');
        if (!input) return;
        if (input.value && String(input.value).trim() !== '') {
            wrapper.classList.add('filled');
        } else {
            wrapper.classList.remove('filled');
        }
    }
    document.querySelectorAll('.form-group-floating').forEach(function(wrapper) {
        var input = wrapper.querySelector('.form-control, .form-select');
        if (input) {
            updateFloatingLabel(wrapper);
            input.addEventListener('input', function() { updateFloatingLabel(wrapper); });
            input.addEventListener('change', function() { updateFloatingLabel(wrapper); });
            input.addEventListener('blur', function() { updateFloatingLabel(wrapper); });
        }
    });
});

// // Set active menu item
// function setActiveMenuItem() {
//     const currentPath = window.location.pathname;
//     const menuLinks = document.querySelectorAll('.sidebar-menu a');
    
//     menuLinks.forEach(link => {
//         const linkPath = new URL(link.href).pathname;
//         if (currentPath.includes(linkPath.split('/').pop())) {
//             link.classList.add('active');
//         }
//     });
// }

// Form validation helper
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Show toast notification (slide-in, auto-dismiss)
function showToast(message, type = 'info') {

    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification alert alert-${type} position-fixed`;
    toast.setAttribute('role', 'alert');

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'danger') icon = 'fa-times-circle';

    toast.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${icon} me-2"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('toast-visible');
    });

    setTimeout(() => {
        toast.classList.remove('toast-visible');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// function showToast(message, type = 'info') {
//     const toast = document.createElement('div');
//     toast.className = `toast-notification alert alert-${type} alert-dismissible fade show position-fixed`;
//     toast.setAttribute('role', 'alert');
//     toast.innerHTML = `
//         <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>${message}
//         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//     `;
//     document.body.appendChild(toast);
//     requestAnimationFrame(() => toast.classList.add('toast-visible'));
//     setTimeout(() => {
//         toast.classList.remove('toast-visible');
//         setTimeout(() => toast.remove(), 300);
//     }, 3000);
// }

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Dummy data generators (for demonstration)
const dummyData = {
    students: [
        { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Computer Science', cgpa: 8.5, status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'Electronics', cgpa: 8.8, status: 'Active' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', course: 'Mechanical', cgpa: 8.2, status: 'Active' },
    ],
    companies: [
        { id: 1, name: 'Tech Corp', email: 'hr@techcorp.com', industry: 'IT', status: 'Active' },
        { id: 2, name: 'Innovate Ltd', email: 'careers@innovate.com', industry: 'Software', status: 'Active' },
    ],
    jobs: [
        { id: 1, title: 'Software Engineer', company: 'Tech Corp', location: 'Bangalore', salary: '8-12 LPA', posted: '2024-01-15', status: 'Open' },
        { id: 2, title: 'Frontend Developer', company: 'Innovate Ltd', location: 'Mumbai', salary: '6-10 LPA', posted: '2024-01-20', status: 'Open' },
    ]
};

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateForm, showToast, formatDate, dummyData };
}
const placementForm = document.getElementById('placementContactForm');
if (placementForm) {
    placementForm.addEventListener('submit', function (e) {
        e.preventDefault();
        showToast('Message sent to Placement Cell successfully!', 'success');
        placementForm.reset();
    });
}
// View Student Details
document.querySelectorAll('.view-student').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('sdName').textContent = btn.dataset.name;
      document.getElementById('sdEmail').textContent = btn.dataset.email;
      document.getElementById('sdPhone').textContent = btn.dataset.phone;
      document.getElementById('sdCgpa').textContent = btn.dataset.cgpa;
      document.getElementById('sdSkills').textContent = btn.dataset.skills;
  
      new bootstrap.Modal(
        document.getElementById('studentDetailsModal')
      ).show();
    });
  });
  
  // Update Status
  function updateStatus(btn, text, cls, icon) {
    const badge = btn.closest('tr').querySelector('.status-badge');
    badge.className = `badge ${cls} status-badge`;
    badge.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
  }
  
  document.querySelectorAll('.action-select').forEach(btn => {
    btn.addEventListener('click', () =>
      updateStatus(btn, 'Selected', 'badge-selected', 'fa-check-circle')
    );
  });
  
  document.querySelectorAll('.action-hold').forEach(btn => {
    btn.addEventListener('click', () =>
      updateStatus(btn, 'On Hold', 'badge-pending', 'fa-pause')
    );
  });
  
document.querySelectorAll('.action-reject').forEach(btn => {
    btn.addEventListener('click', () =>
      updateStatus(btn, 'Rejected', 'badge-rejected', 'fa-times-circle')
    );
  });

  
// comny conform akre tyre 

// Company Dashboard: navigation + applied students page
document.addEventListener('DOMContentLoaded', function () {
    const dashboardPages = document.querySelectorAll('.dashboard-page');
    const pageTitleEl = document.getElementById('page-title');

    if (!dashboardPages.length || !pageTitleEl) return;

    const pageTitles = {
        'page-dashboard': 'Dashboard',
        'page-company-profile': 'Update Company Profile',
        'page-add-requirement': 'Add New Requirement',
        'page-old-requirements': 'Old Requirements',
        'page-current-requirements': 'Current Requirements',
        'page-applied-students': 'Applied Students',
        'page-placement-contact': 'Placement Cell Contact'
    };

    const appliedState = {
        jobId: null,
        jobTitle: ''
    };

    const appliedStudentsData = {
        1: [
            {
                id: 'devops_rajesh',
                name: 'Rajesh Kumar',
                branch: 'Information Technology',
                cgpa: '8.2',
                email: 'rajesh.kumar@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'Docker, Kubernetes, Linux',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            },
            {
                id: 'devops_priya',
                name: 'Priya Sharma',
                branch: 'Computer Science Engineering',
                cgpa: '8.5',
                email: 'priya.sharma@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'CI/CD, AWS, Terraform',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            }
        ],
        2: [
            {
                id: 'qa_amit',
                name: 'Amit Verma',
                branch: 'Computer Science Engineering',
                cgpa: '7.8',
                email: 'amit.verma@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'Manual Testing, Selenium, JIRA',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            },
            {
                id: 'qa_sneha',
                name: 'Sneha Patel',
                branch: 'Information Technology',
                cgpa: '8.0',
                email: 'sneha.patel@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'Automation, Test Cases, API Testing',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            }
        ],
        3: [
            {
                id: 'da_kavya',
                name: 'Kavya Reddy',
                branch: 'Data Science',
                cgpa: '8.7',
                email: 'kavya.reddy@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'SQL, Power BI, Python',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            },
            {
                id: 'da_arjun',
                name: 'Arjun Singh',
                branch: 'Computer Science Engineering',
                cgpa: '8.3',
                email: 'arjun.singh@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'Excel, Statistics, Tableau',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            }
        ],
        4: [
            {
                id: 'se_john',
                name: 'John Doe',
                branch: 'Computer Science Engineering',
                cgpa: '8.5',
                email: 'john.doe@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'Java, Spring Boot, SQL',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            },
            {
                id: 'se_jane',
                name: 'Jane Smith',
                branch: 'Information Technology',
                cgpa: '8.8',
                email: 'jane.smith@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'React, Node.js, REST APIs',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            },
            {
                id: 'se_mike',
                name: 'Mike Johnson',
                branch: 'Computer Science Engineering',
                cgpa: '8.2',
                email: 'mike.johnson@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'DSA, C++, System Design',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            }
        ],
        5: [
            {
                id: 'fe_sarah',
                name: 'Sarah Williams',
                branch: 'Computer Science Engineering',
                cgpa: '8.9',
                email: 'sarah.williams@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'HTML, CSS, JavaScript',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            },
            {
                id: 'fe_david',
                name: 'David Brown',
                branch: 'Information Technology',
                cgpa: '8.4',
                email: 'david.brown@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'React, Bootstrap, Figma',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            }
        ],
        6: [
            {
                id: 'be_emily',
                name: 'Emily Davis',
                branch: 'Computer Science Engineering',
                cgpa: '8.6',
                email: 'emily.davis@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'Node.js, Express, MongoDB',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            },
            {
                id: 'be_robert',
                name: 'Robert Wilson',
                branch: 'Information Technology',
                cgpa: '8.1',
                email: 'robert.wilson@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'Java, Spring, PostgreSQL',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            }
        ],
        7: [
            {
                id: 'py_lisa',
                name: 'Lisa Anderson',
                branch: 'Computer Science Engineering',
                cgpa: '8.7',
                email: 'lisa.anderson@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'Python, Django, REST APIs',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            },
            {
                id: 'py_james',
                name: 'James Taylor',
                branch: 'Information Technology',
                cgpa: '8.3',
                email: 'james.taylor@student.edu',
                phone: '+91 98XXX XXXXX',
                skills: 'Flask, SQL, Git',
                resumeUrl: 'resume/sample.pdf',
                status: 'Under Review'
            }
        ]
    };

    const appliedJobTitleEl = document.getElementById('appliedStudentsJobTitle');
const appliedPositionEl = document.getElementById('appliedStudentsPosition');
const appliedCountBadge = document.getElementById('appliedStudentsCountBadge');
const appliedTableBody = document.getElementById('appliedStudentsTableBody');

const interviewSchedules = {};
let scheduleContext = null;
const scheduleModalEl = document.getElementById('interviewScheduleModal');
const scheduleForm = document.getElementById('interviewScheduleForm');
const scheduleStudentNameEl = document.getElementById('scheduleStudentName');
const scheduleJobTitleEl = document.getElementById('scheduleJobTitle');
const scheduleStudentIdEl = document.getElementById('scheduleStudentId');
const scheduleJobIdEl = document.getElementById('scheduleJobId');
const interviewDateEl = document.getElementById('interviewDate');
const interviewTimeEl = document.getElementById('interviewTime');
const interviewModeEl = document.getElementById('interviewMode');
const meetingLinkGroupEl = document.getElementById('meetingLinkGroup');
const interviewAddressGroupEl = document.getElementById('interviewAddressGroup');
const meetingLinkEl = document.getElementById('meetingLink');
const interviewAddressEl = document.getElementById('interviewAddress');
const interviewRemarksEl = document.getElementById('interviewRemarks');
const confirmScheduleBtn = document.getElementById('confirmScheduleBtn');

// function setActiveNav(pageId) {
//     document.querySelectorAll('.sidebar-menu .nav-link-dashboard').forEach(function (link) {
//         link.classList.remove('active');
//         if (link.getAttribute('data-page') === pageId) {
//             link.classList.add('active');
//         }
//     });
// }

// function showPage(pageId, options = {}) {
//     document.querySelectorAll('.dashboard-page').forEach(function (el) {
//         el.classList.remove('active');
//     });
//     const page = document.getElementById(pageId);
//     if (page) {
//         page.classList.add('active');
//     }

//     if (pageId === 'page-applied-students' && options.jobTitle) {
//         pageTitleEl.textContent = `Applied Students – ${options.jobTitle}`;
//     } else {
//         pageTitleEl.textContent = pageTitles[pageId] || 'Dashboard';
//     }
//     setActiveNav(pageId);
// }

function resetScheduleValidation() {
    [interviewDateEl, interviewTimeEl, interviewModeEl, meetingLinkEl, interviewAddressEl].forEach(function (el) {
        if (el) el.classList.remove('is-invalid');
    });
}

function toggleInterviewMode(mode) {
    if (!meetingLinkGroupEl || !interviewAddressGroupEl) return;
    if (mode === 'online') {
        meetingLinkGroupEl.classList.remove('d-none');
        interviewAddressGroupEl.classList.add('d-none');
        if (meetingLinkEl) meetingLinkEl.required = true;
        if (interviewAddressEl) interviewAddressEl.required = false;
    } else if (mode === 'offline') {
        meetingLinkGroupEl.classList.add('d-none');
        interviewAddressGroupEl.classList.remove('d-none');
        if (meetingLinkEl) meetingLinkEl.required = false;
        if (interviewAddressEl) interviewAddressEl.required = true;
    } else {
        meetingLinkGroupEl.classList.add('d-none');
        interviewAddressGroupEl.classList.add('d-none');
        if (meetingLinkEl) meetingLinkEl.required = false;
        if (interviewAddressEl) interviewAddressEl.required = false;
    }
}

function openScheduleModal(student, jobId, jobTitle, rowEl) {
    if (!scheduleModalEl || !scheduleForm) return;
    scheduleContext = { studentId: student.id, jobId: jobId, rowEl: rowEl };

    if (scheduleStudentNameEl) scheduleStudentNameEl.textContent = student.name || '—';
    if (scheduleJobTitleEl) scheduleJobTitleEl.textContent = jobTitle || '—';
    if (scheduleStudentIdEl) scheduleStudentIdEl.value = student.id || '';
    if (scheduleJobIdEl) scheduleJobIdEl.value = jobId || '';

    const scheduleKey = `${jobId}:${student.id}`;
    const existing = interviewSchedules[scheduleKey];

    if (existing) {
        if (interviewDateEl) interviewDateEl.value = existing.date || '';
        if (interviewTimeEl) interviewTimeEl.value = existing.time || '';
        if (interviewModeEl) interviewModeEl.value = existing.mode || '';
        if (meetingLinkEl) meetingLinkEl.value = existing.meetingLink || '';
        if (interviewAddressEl) interviewAddressEl.value = existing.address || '';
        if (interviewRemarksEl) interviewRemarksEl.value = existing.remarks || '';
    } else {
        scheduleForm.reset();
        if (interviewModeEl) interviewModeEl.value = 'online';
        if (meetingLinkEl) meetingLinkEl.value = '';
        if (interviewAddressEl) interviewAddressEl.value = '';
        if (interviewRemarksEl) interviewRemarksEl.value = '';
    }

    toggleInterviewMode(interviewModeEl ? interviewModeEl.value : '');
    resetScheduleValidation();

    if (window.bootstrap) {
        const modal = new bootstrap.Modal(scheduleModalEl);
        modal.show();
    }
}

function getStatusMeta(status) {
    if (status === 'Interview Scheduled') {
        return { text: status, cls: 'badge-info', icon: 'fa-calendar-check' };
    }
    if (status === 'Selected for Interview') {
        return { text: status, cls: 'badge-selected', icon: 'fa-check-circle' };
    }
    if (status === 'Rejected') {
        return { text: status, cls: 'badge-rejected', icon: 'fa-times-circle' };
    }
    return { text: 'Under Review', cls: 'badge-pending', icon: 'fa-clock' };
}

function renderAppliedStudents(jobId, jobTitle) {
    if (!appliedTableBody) return;
    const students = appliedStudentsData[jobId] || [];

    if (appliedJobTitleEl) appliedJobTitleEl.textContent = jobTitle || '—';
    if (appliedPositionEl) appliedPositionEl.textContent = jobTitle || '—';
    if (appliedCountBadge) {
        appliedCountBadge.innerHTML = `<i class="fas fa-users"></i> ${students.length} Applicants`;
    }

    appliedTableBody.innerHTML = '';

    if (!students.length) {
        appliedTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No applications received yet.</td></tr>';
        return;
    }

    students.forEach(function (student) {
        const scheduleKey = `${jobId}:${student.id}`;
        const scheduleInfo = interviewSchedules[scheduleKey];
        const statusMeta = scheduleInfo
            ? { text: 'Interview Scheduled', cls: 'badge-info', icon: 'fa-calendar-check' }
            : getStatusMeta(student.status);
        const interviewMeta = scheduleInfo
            ? `Date: ${scheduleInfo.date} | Time: ${scheduleInfo.time} | Mode: ${scheduleInfo.modeLabel}`
            : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.branch}</td>
            <td>${student.cgpa}</td>
            <td>
                <a href="${student.resumeUrl}" target="_blank" class="btn btn-sm btn-outline-secondary btn-hover-ripple" aria-label="View Resume PDF">
                    <i class="fas fa-file-pdf me-1"></i>View PDF
                </a>
            </td>
            <td>
                <div class="d-flex flex-wrap align-items-center gap-2">
                    <button type="button"
                        class="btn btn-sm btn-outline-primary btn-icon action-view-profile"
                        data-student-id="${student.id}"
                        data-job-id="${jobId}"
                        data-student-name="${student.name}"
                        data-student-branch="${student.branch}"
                        data-student-cgpa="${student.cgpa}"
                        data-student-email="${student.email}"
                        data-student-phone="${student.phone}"
                        data-student-skills="${student.skills}"
                        data-student-resume="${student.resumeUrl}"
                        aria-label="View Profile">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button"
                        class="btn btn-sm btn-success btn-icon action-select-interview"
                        data-student-id="${student.id}"
                        data-job-id="${jobId}"
                        aria-label="Select for Interview">
                        <i class="fas fa-check"></i>
                    </button>
                    <button type="button"
                        class="btn btn-sm btn-danger btn-icon action-reject-interview"
                        data-student-id="${student.id}"
                        data-job-id="${jobId}"
                        aria-label="Reject for Interview">
                        <i class="fas fa-times"></i>
                    </button>
                    <span class="badge ${statusMeta.cls} status-badge">
                        <i class="fas ${statusMeta.icon}"></i> ${statusMeta.text}
                    </span>
                </div>
                <div class="small text-muted interview-meta" data-student-id="${student.id}">${interviewMeta}</div>
            </td>
        `;
        appliedTableBody.appendChild(row);
    });
}

// document.querySelectorAll('.nav-link-dashboard').forEach(function (link) {
//     link.addEventListener('click', function (e) {
//         const pageId = this.getAttribute('data-page');
//         if (!pageId) return;
//         e.preventDefault();
//         showPage(pageId);
//     });
// });

if (interviewModeEl) {
    interviewModeEl.addEventListener('change', function () {
        toggleInterviewMode(this.value);
    });
}

if (confirmScheduleBtn) {
    confirmScheduleBtn.addEventListener('click', function () {
        if (!scheduleContext) return;
        if (!interviewDateEl || !interviewTimeEl || !interviewModeEl) return;

        resetScheduleValidation();

        let isValid = true;
        if (!interviewDateEl.value) {
            interviewDateEl.classList.add('is-invalid');
            isValid = false;
        }
        if (!interviewTimeEl.value) {
            interviewTimeEl.classList.add('is-invalid');
            isValid = false;
        }
        if (!interviewModeEl.value) {
            interviewModeEl.classList.add('is-invalid');
            isValid = false;
        }

        const mode = interviewModeEl.value;
        if (mode === 'online') {
            if (!meetingLinkEl || !meetingLinkEl.value.trim()) {
                if (meetingLinkEl) meetingLinkEl.classList.add('is-invalid');
                isValid = false;
            }
        }
        if (mode === 'offline') {
            if (!interviewAddressEl || !interviewAddressEl.value.trim()) {
                if (interviewAddressEl) interviewAddressEl.classList.add('is-invalid');
                isValid = false;
            }
        }

        if (!isValid) return;

        const scheduleKey = `${scheduleContext.jobId}:${scheduleContext.studentId}`;
        const scheduleData = {
            date: interviewDateEl.value,
            time: interviewTimeEl.value,
            mode: mode,
            modeLabel: mode === 'online' ? 'Online' : 'Offline',
            meetingLink: meetingLinkEl ? meetingLinkEl.value.trim() : '',
            address: interviewAddressEl ? interviewAddressEl.value.trim() : '',
            remarks: interviewRemarksEl ? interviewRemarksEl.value.trim() : ''
        };
        interviewSchedules[scheduleKey] = scheduleData;

        const list = appliedStudentsData[scheduleContext.jobId] || [];
        const student = list.find(item => item.id === scheduleContext.studentId);
        if (student) student.status = 'Interview Scheduled';

        if (scheduleContext.rowEl) {
            const badge = scheduleContext.rowEl.querySelector('.status-badge');
            if (badge) {
                badge.className = 'badge badge-info status-badge';
                badge.innerHTML = '<i class="fas fa-calendar-check"></i> Interview Scheduled';
            }
            const metaEl = scheduleContext.rowEl.querySelector('.interview-meta');
            if (metaEl) {
                metaEl.textContent = `Date: ${scheduleData.date} | Time: ${scheduleData.time} | Mode: ${scheduleData.modeLabel}`;
            }
        }

        if (typeof showToast === 'function') {
            showToast('Interview scheduled successfully.', 'success');
        }

        if (window.bootstrap && scheduleModalEl) {
            const modal = bootstrap.Modal.getInstance(scheduleModalEl) || new bootstrap.Modal(scheduleModalEl);
            modal.hide();
        }
    });
}

document.addEventListener('click', function (e) {
    const selectBtn = e.target.closest('.action-select-interview');
    if (selectBtn) {
        const studentId = selectBtn.getAttribute('data-student-id');
        const jobId = selectBtn.getAttribute('data-job-id') || appliedState.jobId;
        const list = appliedStudentsData[jobId] || [];
        const student = list.find(item => item.id === studentId);
        if (student) {
            openScheduleModal(student, jobId, appliedState.jobTitle, selectBtn.closest('tr'));
        }
        return;
    }

    const rejectBtn = e.target.closest('.action-reject-interview');
    if (rejectBtn) {
        const badge = rejectBtn.closest('td').querySelector('.status-badge');
        if (badge) {
            badge.className = 'badge badge-rejected status-badge';
            badge.innerHTML = '<i class="fas fa-times-circle"></i> Rejected';
        }
        const studentId = rejectBtn.getAttribute('data-student-id');
        const jobId = rejectBtn.getAttribute('data-job-id') || appliedState.jobId;
        const list = appliedStudentsData[jobId] || [];
        const student = list.find(item => item.id === studentId);
        if (student) student.status = 'Rejected';

        const scheduleKey = `${jobId}:${studentId}`;
        if (interviewSchedules[scheduleKey]) delete interviewSchedules[scheduleKey];
        const metaEl = rejectBtn.closest('tr').querySelector('.interview-meta');
        if (metaEl) metaEl.textContent = '';

        if (typeof showToast === 'function') {
            showToast('Student rejected for interview.', 'danger');
        }
    }
});

const companyProfileForm = document.getElementById('companyProfileForm');
    if (companyProfileForm) {
        companyProfileForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (typeof showToast === 'function') {
                showToast('Company profile updated successfully.', 'success');
            } else {
                alert('Company profile updated successfully.');
            }
        });
    }

    const addRequirementForm = document.getElementById('addRequirementForm');
    if (addRequirementForm) {
        addRequirementForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (typeof showToast === 'function') {
                showToast('New requirement posted successfully.', 'success');
            } else {
                alert('New requirement posted successfully.');
            }
            this.reset();
        });
    }


// Company Certificate Upload Preview + Validation
 const certInput = document.getElementById('companyCertificate');
    const certDrop = document.getElementById('companyCertDrop');
    const certName = document.getElementById('companyCertName');

    if (certInput) {
        certInput.addEventListener('change', function () {

            const file = this.files[0];

            if (!file) {
                certName.textContent = '';
                return;
            }

            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png'
            ];

            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                showToast('Invalid file type. Upload PDF, DOC, DOCX, JPG or PNG only.', 'danger');
                this.value = '';
                certDrop.classList.add('is-invalid');
                return;
            }

            if (file.size > maxSize) {
                showToast('File size must be less than 5MB.', 'danger');
                this.value = '';
                certDrop.classList.add('is-invalid');
                return;
            }

            certDrop.classList.remove('is-invalid');
            certDrop.classList.add('has-file');

            certName.textContent = "Selected: " + file.name;

        });
    }
});

/* ===== Job PDF Upload ===== */

function addNewFileInput(input){

    if(input.files.length > 0){

        const list = document.getElementById("pdfFileList");
        if (!list) return;

        Array.from(input.files).forEach((file) => {
            const row = document.createElement("div");

            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.marginBottom = "5px";

            const name = document.createElement("span");
            name.innerHTML = "📄 " + file.name;
            name.style.background = "#f3f4f6";
            name.style.padding = "5px 10px";
            name.style.borderRadius = "5px";

            const remove = document.createElement("button");
            remove.innerHTML = "❌";
            remove.type = "button";
            remove.style.marginLeft = "8px";
            remove.style.border = "none";
            remove.style.background = "transparent";
            remove.style.cursor = "pointer";

            remove.onclick = function(){
                row.remove();
            };

            row.appendChild(name);
            row.appendChild(remove);

            list.appendChild(row);
        });
    }
}

function addInputField(){

    const container = document.getElementById("pdfUploadContainer");

    const input = document.createElement("input");

    input.type = "file";
    input.name = "job_pdfs";
    input.accept = ".pdf";
    input.className = "form-control form-control-sm mt-2";
    input.style.maxWidth = "500px";

    input.onchange = function(){
        addNewFileInput(this);
    };

    container.appendChild(input);
}

setTimeout(function () {
    let alerts = document.querySelectorAll(".auto-dismiss");
    alerts.forEach(function(alert) {
        alert.classList.remove("show");
        alert.classList.add("fade");
        setTimeout(() => alert.remove(), 500);
    });
}, 3000); 