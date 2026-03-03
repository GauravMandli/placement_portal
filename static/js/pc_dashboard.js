
(function () {



    // Sample data
    const appliedStudentsAdminData = {
        1: [
            { name: 'John Doe', branch: 'CS', cgpa: '8.5', resume: 'john_doe_resume.pdf', appliedDate: '16 Jan 2024' },
            { name: 'Jane Smith', branch: 'ECE', cgpa: '8.8', resume: 'jane_smith_resume.pdf', appliedDate: '17 Jan 2024' }
        ],
        2: [
            { name: 'Sarah Williams', branch: 'CS', cgpa: '8.9', resume: 'sarah_williams_resume.pdf', appliedDate: '21 Jan 2024' }
        ],
        3: [
            { name: 'Mike Johnson', branch: 'ME', cgpa: '8.2', resume: 'mike_johnson_resume.pdf', appliedDate: '19 Jan 2024' }
        ],
        4: [
            { name: 'Rajesh Kumar', branch: 'IT', cgpa: '8.3', resume: 'rajesh_kumar_resume.pdf', appliedDate: '22 Jan 2024' }
        ]
    };

    // var pageTitles = {
    //     'page-home': 'Home',
    //     'page-view-students': 'View Students',
    //     'page-view-companies': 'View Companies',
    //     'page-view-requirements': 'View Requirements',
    //     'page-approve-companies': 'Approve Companies',
    //     'page-view-contacts': 'View Contacts'
    // };

    // function showPage(pageId) {
    //     document.querySelectorAll('.dashboard-page').forEach(function(el) {
    //         el.classList.remove('active');
    //     });
    //     var page = document.getElementById(pageId);
    //     if (page) {
    //         page.classList.add('active');
    //     }
    //     var titleEl = document.getElementById('page-title');
    //     if (titleEl) {
    //         titleEl.textContent = pageTitles[pageId] || 'Home';
    //     }
    //     document.querySelectorAll('.sidebar-menu .nav-link-dashboard').forEach(function(link) {
    //         link.classList.remove('active');
    //         if (link.getAttribute('data-page') === pageId) {
    //             link.classList.add('active');
    //         }
    //     });
    // }

    // // Sidebar navigation
    // document.querySelectorAll('.nav-link-dashboard').forEach(function(link) {
    //     link.addEventListener('click', function(e) {
    //         e.preventDefault();
    //         var pageId = this.getAttribute('data-page');
    //         if (pageId) {
    //             showPage(pageId);
    //         }
    //     });
    // });

    // ===============================
    // View Company Details (AJAX)
    // ===============================
    document.querySelectorAll(".view-company-details").forEach(function (button) {

        button.addEventListener("click", function () {

            const slug = this.dataset.slug;

            fetch(`/placement_cell/company-detail/${slug}/`)
                .then(response => response.json())
                .then(response => {

                    if (!response.success) return;

                    const data = response.data;

                    // Store current company globally
                    window.currentCompanyId = data.id;
                    window.currentCompanyName = data.company_name;

                    // Show / Hide Approve / Reject buttons
                    const approveBtn = document.getElementById("openApproveConfirm");
                    const rejectBtn = document.getElementById("openRejectConfirm");

                    approveBtn.style.display = "none";
                    rejectBtn.style.display = "none";

                    if (data.status === "Pending") {
                        approveBtn.style.display = "inline-block";
                        rejectBtn.style.display = "inline-block";
                    } else if (data.status === "Approved") {
                        rejectBtn.style.display = "inline-block";
                    } else if (data.status === "Rejected") {
                        approveBtn.style.display = "inline-block";
                    }

                    let statusBadge = "";

                    if (data.status === "Approved") {
                        statusBadge = '<span class="badge bg-success">Approved</span>';
                    } else if (data.status === "Pending") {
                        statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
                    } else {
                        statusBadge = '<span class="badge bg-danger">Rejected</span>';
                    }

                    document.getElementById("companyDetailsContent").innerHTML = `
                        <h5>${data.company_name}</h5>
                        <p><strong>Status:</strong> ${statusBadge}</p>
                        <hr>
                        <p><strong>Industry:</strong> ${data.industry}</p>
                        <p><strong>Email:</strong> ${data.company_email}</p>
                        <p><strong>Phone:</strong> ${data.phone}</p>
                        <p><strong>Website:</strong> <a href="${data.website}" target="_blank">${data.website}</a></p>
                        <p><strong>Contact Person Name:</strong> ${data.contact_person_name}</p>
                        <p><strong>Designation:</strong> ${data.designation}</p>
                        <p><strong>Contact Person Email:</strong> ${data.contact_email}</p>
                        <p><strong>Contact Person Phone:</strong> ${data.contact_phone}</p>
                        <p><strong>GST:</strong> ${data.gst_number || "N/A"}</p>
                        <p><strong>Company Size:</strong> ${data.company_size || "N/A"}</p>
                        <p><strong>Registered On:</strong> ${data.created_at}</p>
                        <p><strong>Description:</strong><br>${data.description}</p>
                        <p><strong>Address:</strong><br>${data.address}</p>
                        <a href="${data.certificate_url}" class="btn btn-outline-secondary mt-2" target="_blank">
                            View Registration Certificate
                        </a>
                    `;

                    new bootstrap.Modal(document.getElementById("companyDetailsModal")).show();
                });
        });

    });


    // ===============================
    // Open Confirmation Modals
    // ===============================
    document.getElementById("openApproveConfirm").addEventListener("click", function () {
        document.getElementById("confirmApproveCompanyName").innerText = window.currentCompanyName;
        new bootstrap.Modal(document.getElementById("approveCompanyModal")).show();
    });

    document.getElementById("openRejectConfirm").addEventListener("click", function () {
        document.getElementById("confirmRejectCompanyName").innerText = window.currentCompanyName;
        new bootstrap.Modal(document.getElementById("rejectCompanyModal")).show();
    });


    // ===============================
    // Company Action (Approve / Reject)
    // ===============================
 function getCSRFToken() {
    let cookieValue = null;
    const name = 'csrftoken';

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();

            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }
    return cookieValue;
}

    document.getElementById("confirmApproveBtn").addEventListener("click", function () {

        fetch(`/placement_cell/approve-company/${window.currentCompanyId}/`,
            {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                }
            }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert("Approval failed!");
                }
            });
    });

    document.getElementById("confirmRejectCompanyBtn").addEventListener("click", function () {

        fetch(`/placement_cell/reject-company/${window.currentCompanyId}/`,
            {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                }
            }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert("Approval failed!");
                }
            });
    });


    // View Applied Students (Admin)
    document.querySelectorAll('.view-applied-students-admin').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var jobId = this.getAttribute('data-job-id');
            var jobTitle = this.getAttribute('data-job-title');
            var students = appliedStudentsAdminData[jobId] || [];

            document.getElementById('admin-modal-job-title').textContent = jobTitle;
            var tbody = document.getElementById('admin-applied-students-table-body');
            tbody.innerHTML = '';

            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No applications received yet.</td></tr>';
            } else {
                students.forEach(function (student) {
                    var row = document.createElement('tr');
                    row.innerHTML = `
                                <td>${student.name}</td>
                                <td>${student.branch}</td>
                                <td>${student.cgpa}</td>
                                <td>
                                    <a href="#" class="btn btn-sm btn-outline-primary" onclick="downloadResume('${student.resume}'); return false;">
                                        <i class="fas fa-download me-1"></i>Download
                                    </a>
                                </td>
                                <td>${student.appliedDate}</td>
                            `;
                    tbody.appendChild(row);
                });
            }

            var modal = new bootstrap.Modal(document.getElementById('appliedStudentsAdminModal'));
            modal.show();
        });
    });

    // Approve/Reject Companies
    document.querySelectorAll('.approve-company').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var companyId = this.getAttribute('data-company-id');
            var companyName = this.getAttribute('data-company-name');
            document.getElementById('confirmApproveCompanyName').textContent = companyName;
            document.getElementById('confirmApproveBtn').setAttribute('data-company-id', companyId);
            document.getElementById('confirmApproveBtn').setAttribute('data-company-name', companyName);
            var modal = new bootstrap.Modal(document.getElementById('approveCompanyModal'));
            modal.show();
        });
    });

    document.querySelectorAll('.reject-company').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var companyId = this.getAttribute('data-company-id');
            var companyName = this.getAttribute('data-company-name');
            document.getElementById('confirmRejectCompanyName').textContent = companyName;
            document.getElementById('confirmRejectCompanyBtn').setAttribute('data-company-id', companyId);
            document.getElementById('confirmRejectCompanyBtn').setAttribute('data-company-name', companyName);
            var modal = new bootstrap.Modal(document.getElementById('rejectCompanyModal'));
            modal.show();
        });
    });




    // View Requirement Details
    document.querySelectorAll('.view-requirement-details').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var jobTitle = this.getAttribute('data-job-title');
            var company = this.getAttribute('data-company');
            var jobId = this.getAttribute('data-job-id');

            var requirementDetails = {
                1: { title: 'Software Engineer', company: 'Tech Corp', type: 'Full Time', salary: '8-12 LPA', location: 'Bangalore', skills: 'Java, Spring, SQL', eligibility: 'CGPA ≥ 7.5', posted: '15 Jan 2024', applications: 15 },
                2: { title: 'Frontend Developer', company: 'Innovate Ltd', type: 'Full Time', salary: '6-10 LPA', location: 'Mumbai', skills: 'React, JavaScript, HTML/CSS', eligibility: 'CGPA ≥ 7.0', posted: '20 Jan 2024', applications: 8 },
                3: { title: 'Backend Developer', company: 'Cloud Solutions', type: 'Full Time', salary: '7-11 LPA', location: 'Hyderabad', skills: 'Node.js, MongoDB, Express', eligibility: 'CGPA ≥ 7.0', posted: '18 Jan 2024', applications: 12 },
                4: { title: 'Python Developer', company: 'Data Labs', type: 'Full Time', salary: '9-13 LPA', location: 'Pune', skills: 'Python, Django, SQL', eligibility: 'CGPA ≥ 7.5', posted: '22 Jan 2024', applications: 10 }
            };

            var details = requirementDetails[jobId] || { title: jobTitle, company: company, type: 'Full Time', salary: 'Competitive', location: 'Multiple', skills: 'Various', eligibility: 'As per requirements', posted: 'Recent', applications: 0 };

            document.getElementById('requirementDetailsTitle').textContent = details.title;
            document.getElementById('requirementDetailsCompany').textContent = details.company;
            document.getElementById('requirementDetailsType').textContent = details.type;
            document.getElementById('requirementDetailsSalary').textContent = details.salary;
            document.getElementById('requirementDetailsLocation').textContent = details.location;
            document.getElementById('requirementDetailsSkills').textContent = details.skills;
            document.getElementById('requirementDetailsEligibility').textContent = details.eligibility;
            document.getElementById('requirementDetailsPosted').textContent = details.posted;
            document.getElementById('requirementDetailsApplications').textContent = details.applications;

            var modal = new bootstrap.Modal(document.getElementById('requirementDetailsModal'));
            modal.show();
        });
    });
    // ===============================
    // View Student Profile (Admin)
    // ===============================

    document.querySelectorAll(".view-student-details-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {

            // Basic Info
            document.getElementById("profileStudentId").innerText =
                this.dataset.id || "N/A";

            document.getElementById("profileStudentName").innerText =
                this.dataset.name || "N/A";

            document.getElementById("profileStudentGender").innerText =
                this.dataset.gender || "N/A";

            document.getElementById("profileStudentDob").innerText =
                this.dataset.dob || "N/A";

            document.getElementById("profileStudentEnrollNumber").innerText =
                this.dataset.enrollno || "N/A";

            document.getElementById("profileStudentEmail").innerText =
                this.dataset.email || "N/A";

            document.getElementById("profileStudentPhone").innerText =
                this.dataset.phone || "N/A";

            document.getElementById("profileStudentCgpa").innerText =
                this.dataset.cgpa || "N/A";

            document.getElementById("profileStudentBranch").innerText =
                this.dataset.branch || "N/A";

            document.getElementById("profileStudentYear").innerText =
                this.dataset.year || "N/A";

            document.getElementById("profileStudentSkills").innerText =
                this.dataset.skills || "N/A";

            // Photo
            var photo = this.dataset.photo;
            var photoEl = document.getElementById("profileStudentPhoto");

            if (photo) {
                photoEl.src = photo;
                photoEl.style.display = "block";
            } else {
                photoEl.style.display = "none";
            }

            // LinkedIn
            var linkedin = this.dataset.linkedin;
            var linkedinEl = document.getElementById("profileStudentLinkedin");

            if (linkedin) {
                linkedinEl.href = linkedin;
                linkedinEl.innerText = linkedin;
                linkedinEl.style.display = "inline";
            } else {
                linkedinEl.style.display = "none";
            }

            // GitHub
            var github = this.dataset.github;
            var githubEl = document.getElementById("profileStudentGithub");

            if (github) {
                githubEl.href = github;
                githubEl.innerText = github;
                githubEl.style.display = "inline";
            } else {
                githubEl.style.display = "none";
            }

            // Portfolio
            var portfolio = this.dataset.portfolio;
            var portfolioEl = document.getElementById("profileStudentPortfolio");

            if (portfolio) {
                portfolioEl.href = portfolio;
                portfolioEl.innerText = portfolio;
                portfolioEl.style.display = "inline";
            } else {
                portfolioEl.style.display = "none";
            }

            // Resume
            var resume = this.dataset.resume;
            var resumeEl = document.getElementById("profileStudentResumeLink");

            if (resume) {
                resumeEl.href = resume;
                resumeEl.style.display = "inline-block";
            } else {
                resumeEl.style.display = "none";
            }


        });
    });
    // // ===============================
    // // delete Student Profile (Admin)
    // // ===============================
    // document.querySelectorAll(".delete-student").forEach(function (btn) {
    //     btn.addEventListener("click", function () {

    //         var studentId = this.dataset.studentId;
    //         var studentName = this.dataset.studentName;

    //         if (confirm("Delete " + studentName + " ?")) {
    //             window.location.href = "/placement_cell/delete-student/" + studentId + "/";
    //         }

    //     });
    // });


    // Resume functions
    window.viewResume = function (filename) {
        alert('Opening resume: ' + filename + '\n\n(In a real application, this would open the PDF in a new tab or viewer.)');
    };

    window.downloadResume = function (filename) {
        alert('Downloading resume: ' + filename + '\n\n(In a real application, this would trigger a file download.)');
    };
})();



