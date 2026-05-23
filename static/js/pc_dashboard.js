// pc_dashbord.js (FULL - Premium Company Details Modal version)
(function () {

    // ===============================
    // Sample data (kept as you had)
    // ===============================
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

    // ===============================
    // Helpers (Premium modal support)
    // ===============================
    function val(v) {
        return (v !== undefined && v !== null && String(v).trim() !== "") ? v : null;
    }

    function sk(w = "col-12") {
        return `<span class="placeholder ${w}"></span>`;
    }

    function setCompanyLoadingState() {
        const industryEl = document.getElementById("companyIndustry");
        const sizeEl = document.getElementById("companySize");
        const createdEl = document.getElementById("companyCreatedAt");

        if (industryEl) industryEl.innerHTML = sk("col-6");
        if (sizeEl) sizeEl.innerHTML = sk("col-4");
        if (createdEl) createdEl.innerHTML = sk("col-5");

        const contentEl = document.getElementById("companyDetailsContent");
        if (contentEl) {
            contentEl.innerHTML = `
        <div class="cd-grid">
          <div class="cd-card"><div class="cd-card-h">${sk("col-6")}</div><div class="cd-card-b">${sk("col-10")}<br>${sk("col-8")}<br>${sk("col-9")}</div></div>
          <div class="cd-card"><div class="cd-card-h">${sk("col-6")}</div><div class="cd-card-b">${sk("col-9")}<br>${sk("col-7")}<br>${sk("col-8")}</div></div>
          <div class="cd-card"><div class="cd-card-h">${sk("col-6")}</div><div class="cd-card-b">${sk("col-8")}<br>${sk("col-9")}</div></div>
          <div class="cd-card"><div class="cd-card-h">${sk("col-6")}</div><div class="cd-card-b">${sk("col-9")}<br>${sk("col-7")}</div></div>
          <div class="cd-card cd-span-2"><div class="cd-card-h">${sk("col-6")}</div><div class="cd-card-b">${sk("col-12")}<br>${sk("col-11")}<br>${sk("col-10")}</div></div>
        </div>
      `;
        }

        const msg = document.getElementById("companyDetailsStateMsg");
        if (msg) msg.classList.add("d-none");

        const certBtn = document.getElementById("companyCertificateBtn");
        if (certBtn) certBtn.classList.add("d-none");

        const webBtn = document.getElementById("companyWebsiteBtn");
        if (webBtn) webBtn.classList.add("d-none");

        const badge = document.getElementById("companyStatusBadge");
        if (badge) badge.classList.add("d-none");
    }

    function setCompanyHeaderBits(data) {
        const industryEl = document.getElementById("companyIndustry");
        const sizeEl = document.getElementById("companySize");
        const createdEl = document.getElementById("companyCreatedAt");

        if (industryEl) industryEl.innerText = val(data.industry) || "N/A";
        if (sizeEl) sizeEl.innerText = val(data.company_size) || "N/A";

        let created = "N/A";
        try {
            created = data.created_at ? new Date(data.created_at).toLocaleDateString() : "N/A";
        } catch (e) { }
        if (createdEl) createdEl.innerText = created;

        // Status badge
        const badge = document.getElementById("companyStatusBadge");
        if (badge) {
            badge.className = "badge"; // reset
            if (data.status === "Approved") {
                badge.classList.add("bg-success");
                badge.textContent = "Approved";
            } else if (data.status === "Pending") {
                badge.classList.add("bg-warning", "text-dark");
                badge.textContent = "Pending";
            } else if (data.status === "Rejected") {
                badge.classList.add("bg-danger");
                badge.textContent = "Rejected";

            } else if (data.status === "Hold") {
                badge.classList.add("bg-warning", "text-dark");
                badge.textContent = "On Hold";
            } else {
                badge.classList.add("bg-secondary");
                badge.textContent = data.status || "N/A";
            }
            badge.classList.remove("d-none");
        }
        // Footer buttons
        const certBtn = document.getElementById("companyCertificateBtn");
        if (certBtn && data.certificate_url) {
            certBtn.href = data.certificate_url;
            certBtn.classList.remove("d-none");
        } else if (certBtn) {
            certBtn.classList.add("d-none");
        }

        const webBtn = document.getElementById("companyWebsiteBtn");
        if (webBtn && data.website) {
            webBtn.href = data.website;
            webBtn.classList.remove("d-none");
        } else if (webBtn) {
            webBtn.classList.add("d-none");
        }
    }

    function fillCompanyDetails(data) {
        setCompanyHeaderBits(data);

        const safeText = (t) => (val(t) ? t : `<span class="text-muted">N/A</span>`);
        const safeLink = (href, label) => {
            if (!val(href)) return `<span class="text-muted">N/A</span>`;
            const show = label || href;
            return `<a href="${href}" target="_blank" rel="noopener">${show}</a>`;
        };

        const contentEl = document.getElementById("companyDetailsContent");
        if (!contentEl) return;

        contentEl.innerHTML = `
      <div class="cd-grid">
        <div class="cd-card">
          <div class="cd-card-h"><i class="fas fa-building me-2 text-accent"></i>Company Info</div>
          <div class="cd-card-b">
            <div class="cd-row"><div class="cd-k">Company</div><div class="cd-v">${safeText(data.company_name)}</div></div>
            <div class="cd-row"><div class="cd-k">Industry</div><div class="cd-v">${safeText(data.industry)}</div></div>
            <div class="cd-row"><div class="cd-k">Website</div><div class="cd-v">${safeLink(data.website, data.website)}</div></div>
            <div class="cd-row"><div class="cd-k">Company Size</div><div class="cd-v">${safeText(data.company_size)}</div></div>
          </div>
        </div>

        <div class="cd-card">
          <div class="cd-card-h"><i class="fas fa-user me-2 text-accent"></i>Contact Info</div>
          <div class="cd-card-b">
            <div class="cd-row"><div class="cd-k">Company Email</div><div class="cd-v">${val(data.company_email) ? `<a href="mailto:${data.company_email}">${data.company_email}</a>` : `<span class="text-muted">N/A</span>`}</div></div>
            <div class="cd-row"><div class="cd-k">Phone</div><div class="cd-v">${val(data.phone) ? `<a href="tel:${data.phone}">${data.phone}</a>` : `<span class="text-muted">N/A</span>`}</div></div>
            <div class="cd-row"><div class="cd-k">Contact Person</div><div class="cd-v">${safeText(data.contact_person_name)}</div></div>
            <div class="cd-row"><div class="cd-k">Designation</div><div class="cd-v">${safeText(data.designation)}</div></div>
          </div>
        </div>

        <div class="cd-card">
          <div class="cd-card-h"><i class="fas fa-info-circle me-2 text-accent"></i>Additional</div>
          <div class="cd-card-b">
            <div class="cd-row"><div class="cd-k">GST Number</div><div class="cd-v">${safeText(data.gst_number)}</div></div>
            <div class="cd-row"><div class="cd-k">Status</div><div class="cd-v">${safeText(data.status)}</div></div>
          </div>
        </div>

        <div class="cd-card">
          <div class="cd-card-h"><i class="fas fa-address-book me-2 text-accent"></i>Contact Details</div>
          <div class="cd-card-b">
            <div class="cd-row"><div class="cd-k">Contact Email</div><div class="cd-v">${val(data.contact_email) ? `<a href="mailto:${data.contact_email}">${data.contact_email}</a>` : `<span class="text-muted">N/A</span>`}</div></div>
            <div class="cd-row"><div class="cd-k">Contact Phone</div><div class="cd-v">${val(data.contact_phone) ? `<a href="tel:${data.contact_phone}">${data.contact_phone}</a>` : `<span class="text-muted">N/A</span>`}</div></div>
          </div>
        </div>

        <div class="cd-card cd-span-2">
          <div class="cd-card-h"><i class="fas fa-align-left me-2 text-accent"></i>Description</div>
          <div class="cd-card-b cd-pre">${safeText(data.description)}</div>
        </div>

        <div class="cd-card cd-span-2">
          <div class="cd-card-h"><i class="fas fa-map-marker-alt me-2 text-accent"></i>Address</div>
          <div class="cd-card-b cd-pre">${safeText(data.address)}</div>
        </div>
      </div>
    `;

        const msg = document.getElementById("companyDetailsStateMsg");
        if (msg) msg.classList.add("d-none");
    }

    function showCompanyErrorState() {
        const msg = document.getElementById("companyDetailsStateMsg");
        if (!msg) return;
        msg.classList.remove("d-none");
        msg.innerHTML = `<i class="fas fa-triangle-exclamation me-2"></i>Failed to load company details. Please try again.`;
    }

    // ===============================
    // View Company Details (AJAX)
    // ===============================
    document.querySelectorAll(".view-company-details").forEach(function (button) {
        button.addEventListener("click", function () {
            const slug = this.dataset.slug;

            // open modal first + skeleton loading
            const modalEl = document.getElementById("companyDetailsModal");
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
            setCompanyLoadingState();

            fetch(`/placement_cell/company-detail/${slug}/`)
                .then(res => res.json())
                .then(response => {
                    if (!response || !response.success) {
                        showCompanyErrorState();
                        return;
                    }

                    const data = response.data;
                    // ✅ FIX TITLE (always same)
                    const titleEl = document.getElementById("companyDetailsModalLabel");
                    if (titleEl) {
                        titleEl.innerHTML = `<i class="fas fa-building me-2 text-accent"></i>Company Details`;
                    }

                    // ✅ Company Name header ma
                    const nameEl = document.getElementById("companyNameHeader");
                    if (nameEl) {
                        nameEl.innerText = val(data.company_name) || "N/A";
                    }

                    const vacancyEl = document.getElementById("companyVacancy");
                    if (vacancyEl) {
                        vacancyEl.innerText = val(data.vacancies) || "N/A";
                    }

                    // Store current company globally (kept)
                    window.currentCompanyId = data.id;
                    window.currentCompanyName = data.company_name;

                    // Show / Hide Approve / Reject buttons (kept logic)
                    const approveBtn = document.getElementById("openApproveConfirm");
const rejectBtn = document.getElementById("openRejectConfirm");
const holdBtn = document.getElementById("openHoldConfirm");

// 🔒 Hide all first
if (approveBtn) approveBtn.style.display = "none";
if (rejectBtn) rejectBtn.style.display = "none";
if (holdBtn) holdBtn.style.display = "none";

// 🎯 Status-based logic
if (data.status === "Pending") {
    if (approveBtn) approveBtn.style.display = "inline-block";
    if (rejectBtn) rejectBtn.style.display = "inline-block";
    if (holdBtn) holdBtn.style.display = "inline-block";
}
else if (data.status === "Approved") {
    if (rejectBtn) rejectBtn.style.display = "inline-block";
    if (holdBtn) holdBtn.style.display = "inline-block";
}
else if (data.status === "Rejected") {
    if (approveBtn) approveBtn.style.display = "inline-block";
}
else if (data.status === "On Hold") {
        // 🔥 KEY CASE
    if (approveBtn) approveBtn.style.display = "inline-block";
    if (rejectBtn) rejectBtn.style.display = "inline-block";
}
                    // Fill premium UI content
                    fillCompanyDetails(data);
                })
                .catch(err => {
                    console.error(err);
                    showCompanyErrorState();
                });
        });
    });

    // ===============================
    // Open Confirmation Modals (kept)
    // ===============================
    const openApproveBtn = document.getElementById("openApproveConfirm");
    if (openApproveBtn) {
        openApproveBtn.addEventListener("click", function () {
            const companyModal = bootstrap.Modal.getInstance(document.getElementById("companyDetailsModal"));
            if (companyModal) companyModal.hide();

            const nameEl = document.getElementById("confirmApproveCompanyName");
            if (nameEl) nameEl.innerText = window.currentCompanyName || "";

            setTimeout(() => {
                new bootstrap.Modal(document.getElementById("approveCompanyModal")).show();
            }, 300);
        });
    }

    const openRejectBtn = document.getElementById("openRejectConfirm");
    if (openRejectBtn) {
        openRejectBtn.addEventListener("click", function () {
            const companyModal = bootstrap.Modal.getInstance(document.getElementById("companyDetailsModal"));
            if (companyModal) companyModal.hide();

            const nameEl = document.getElementById("confirmRejectCompanyName");
            if (nameEl) nameEl.innerText = window.currentCompanyName || "";

            setTimeout(() => {
                new bootstrap.Modal(document.getElementById("rejectCompanyModal")).show();
            }, 300);
        });
    }

    const openHoldBtn = document.getElementById("openHoldConfirm");

    if (openHoldBtn) {
        openHoldBtn.addEventListener("click", function () {

            const companyModal = bootstrap.Modal.getInstance(document.getElementById("companyDetailsModal"));
            if (companyModal) companyModal.hide();

            document.getElementById("confirmHoldCompanyName").innerText = window.currentCompanyName || "";

            setTimeout(() => {
                new bootstrap.Modal(document.getElementById("holdCompanyModal")).show();
            }, 300);
        });
    }

    // ===============================
    // Company Action (Approve / Reject) (kept)
    // ===============================
    function getCSRFToken() {
        let cookieValue = null;
        const name = 'csrftoken';

        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const confirmApproveBtn = document.getElementById("confirmApproveBtn");
    if (confirmApproveBtn) {
        confirmApproveBtn.addEventListener("click", function () {
            fetch(`/placement_cell/approve-company/${window.currentCompanyId}/`, {
                method: "POST",
                headers: { "X-CSRFToken": getCSRFToken() }
            })
                .then(r => r.json())
                .then(data => {
                    if (data.success) location.reload();
                    else alert("Approval failed!");
                })
                .catch(() => alert("Approval failed!"));
        });
    }

    const confirmRejectCompanyBtn = document.getElementById("confirmRejectCompanyBtn");
    if (confirmRejectCompanyBtn) {
        confirmRejectCompanyBtn.addEventListener("click", function () {
            fetch(`/placement_cell/reject-company/${window.currentCompanyId}/`, {
                method: "POST",
                headers: { "X-CSRFToken": getCSRFToken() }
            })
                .then(r => r.json())
                .then(data => {
                    if (data.success) location.reload();
                    else alert("Rejection failed!");
                })
                .catch(() => alert("Rejection failed!"));
        });
    }

    const confirmHoldBtn = document.getElementById("confirmHoldBtn");

    if (confirmHoldBtn) {
        confirmHoldBtn.addEventListener("click", function () {

            fetch(`/placement_cell/hold-company/${window.currentCompanyId}/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken()
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert("Hold failed!");
                    }
                })
                .catch(() => alert("Hold failed!"));
        });
    }

    // ===============================
    // Placement Cell - Job Details (AJAX + Modal)
    // ===============================

    // ===============================
    // View Applied Students (Admin) (kept)
    // ===============================
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

    // ===============================
    // Approve/Reject Companies (table buttons) (kept)
    // ===============================
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

   

    // ===============================
    // View Student Profile (Admin) (kept)
    // ===============================
    document.querySelectorAll(".view-student-details-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            document.getElementById("profileStudentId").innerText = this.dataset.id || "N/A";
            document.getElementById("profileStudentName").innerText = this.dataset.name || "N/A";
            document.getElementById("profileStudentGender").innerText = this.dataset.gender || "N/A";
            document.getElementById("profileStudentDob").innerText = this.dataset.dob || "N/A";
            document.getElementById("profileStudentEnrollNumber").innerText = this.dataset.enrollno || "N/A";
            document.getElementById("profileStudentEmail").innerText = this.dataset.email || "N/A";
            document.getElementById("profileStudentPhone").innerText = this.dataset.phone || "N/A";
            document.getElementById("profileStudentCgpa").innerText = this.dataset.cgpa || "N/A";
            document.getElementById("profileStudentBranch").innerText = this.dataset.branch || "N/A";
            document.getElementById("profileStudentYear").innerText = this.dataset.year || "N/A";
            document.getElementById("profileStudentSkills").innerText = this.dataset.skills || "N/A";

            var photo = this.dataset.photo;
            var photoEl = document.getElementById("profileStudentPhoto");
            if (photo) {
                photoEl.src = photo;
                photoEl.style.display = "block";
            } else {
                photoEl.style.display = "none";
            }

            var linkedin = this.dataset.linkedin;
            var linkedinEl = document.getElementById("profileStudentLinkedin");
            if (linkedin) {
                linkedinEl.href = linkedin;
                linkedinEl.innerText = linkedin;
                linkedinEl.style.display = "inline";
            } else {
                linkedinEl.style.display = "none";
            }

            var github = this.dataset.github;
            var githubEl = document.getElementById("profileStudentGithub");
            if (github) {
                githubEl.href = github;
                githubEl.innerText = github;
                githubEl.style.display = "inline";
            } else {
                githubEl.style.display = "none";
            }

            var portfolio = this.dataset.portfolio;
            var portfolioEl = document.getElementById("profileStudentPortfolio");
            if (portfolio) {
                portfolioEl.href = portfolio;
                portfolioEl.innerText = portfolio;
                portfolioEl.style.display = "inline";
            } else {
                portfolioEl.style.display = "none";
            }

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

    // ===============================
    // Resume functions (kept)
    // ===============================
    window.viewResume = function (filename) {
        alert('Opening resume: ' + filename + '\n\n(In a real application, this would open the PDF in a new tab or viewer.)');
    };

    window.downloadResume = function (filename) {
        alert('Downloading resume: ' + filename + '\n\n(In a real application, this would trigger a file download.)');
    };

})();

// stydent_dashbord.js (FULL) — Student: premium company view (NO status/registered) + job details
document.addEventListener('DOMContentLoaded', function () {

    // ===============================
    // Helpers
    // ===============================
    function escapeHtml(str) {
        return String(str ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function safeText(v) {
        return (v !== undefined && v !== null && String(v).trim() !== '') ? v : null;
    }

    // ===============================
    // Job role filter
    // ===============================
    var filterEl = document.getElementById('jobRoleFilter');
    if (filterEl) {
        filterEl.addEventListener('change', function () {
            var role = this.value;
            document.querySelectorAll('.job-card-item').forEach(function (card) {
                var show = !role || card.getAttribute('data-role') === role;
                card.style.display = show ? '' : 'none';
            });
        });
    }

    // ===============================
    // File drop zone (PDF only)
    // ===============================
    var resumeDropZone = document.getElementById('resumeDropZone');
    var resumeUpload = document.getElementById('resumeUpload');
    var resumeFileName = document.getElementById('resumeFileName');

    if (resumeDropZone && resumeUpload) {
        resumeDropZone.addEventListener('click', function (e) {
            if (e.target !== resumeUpload) resumeUpload.click();
        });

        resumeDropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
            resumeDropZone.classList.add('drag-over');
        });

        resumeDropZone.addEventListener('dragleave', function (e) {
            e.preventDefault();
            e.stopPropagation();
            resumeDropZone.classList.remove('drag-over');
        });

        resumeDropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
            resumeDropZone.classList.remove('drag-over');
            var files = e.dataTransfer && e.dataTransfer.files;
            if (files && files.length) handleResumeFile(files[0]);
        });

        resumeUpload.addEventListener('change', function () {
            var file = this.files && this.files[0];
            if (file) handleResumeFile(file);
        });

        function handleResumeFile(file) {
            var isPdf = file.type === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'));
            var maxSize = 2 * 1024 * 1024;

            resumeDropZone.classList.remove('is-invalid', 'has-file');

            if (!isPdf) {
                resumeDropZone.classList.add('is-invalid');
                if (typeof showToast === 'function') showToast('Please upload a PDF file only.', 'danger');
                resumeUpload.value = '';
                resumeFileName.textContent = '';
                return;
            }

            if (file.size > maxSize) {
                resumeDropZone.classList.add('is-invalid');
                if (typeof showToast === 'function') showToast('File must be 2MB or less.', 'danger');
                resumeUpload.value = '';
                resumeFileName.textContent = '';
                return;
            }

            resumeDropZone.classList.add('has-file');
            resumeFileName.textContent = file.name;
        }
    }

    // ===============================
    // Passport photo preview
    // ===============================
    var passportPhotoInput = document.getElementById('studentPassportPhoto');
    var passportPhotoImg = document.getElementById('passportPhotoImg');
    var passportPhotoPlaceholder = document.getElementById('passportPhotoPlaceholder');

    if (passportPhotoInput && passportPhotoImg && passportPhotoPlaceholder) {
        passportPhotoInput.addEventListener('change', function () {
            var file = this.files && this.files[0];

            if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')) {
                if (file.size > 500 * 1024) {
                    if (typeof showToast === 'function') showToast('Photo must be 500KB or less.', 'danger');
                    this.value = '';
                    return;
                }

                var reader = new FileReader();
                reader.onload = function () {
                    passportPhotoImg.src = reader.result;
                    passportPhotoImg.style.display = 'block';
                    passportPhotoPlaceholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            } else if (!file) {
                passportPhotoImg.src = '';
                passportPhotoImg.style.display = 'none';
                passportPhotoPlaceholder.style.display = 'block';
            } else {
                if (typeof showToast === 'function') showToast('Please select JPG or PNG image.', 'danger');
                this.value = '';
            }
        });
    }

    // ===============================
    // Apply Job Confirmation
    // ===============================
    document.querySelectorAll('.apply-job-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var jobTitle = this.getAttribute('data-job-title');
            document.getElementById('confirmJobTitle').textContent = jobTitle;
            var modal = new bootstrap.Modal(document.getElementById('applyJobModal'));
            modal.show();
        });
    });

    // Confirm Apply (with loading spinner)
    var confirmApplyBtn = document.getElementById('confirmApplyBtn');
    if (confirmApplyBtn) {
        confirmApplyBtn.addEventListener('click', function () {
            var btn = this;
            if (btn.classList.contains('btn-loading')) return;

            btn.classList.add('btn-loading');
            btn.disabled = true;

            var originalHtml = btn.innerHTML;
            btn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Submitting...';

            setTimeout(function () {
                btn.classList.remove('btn-loading');
                btn.disabled = false;
                btn.innerHTML = originalHtml;

                if (typeof showToast === 'function') showToast('Application Submitted', 'success');
                else alert('Application Submitted');

                bootstrap.Modal.getInstance(document.getElementById('applyJobModal')).hide();
            }, 1500);
        });
    }

    // ===============================
    // View Application Details
    // ===============================
    document.querySelectorAll('.view-application-details').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var jobTitle = this.getAttribute('data-job-title');
            var company = this.getAttribute('data-company');
            var status = this.getAttribute('data-status');

            document.getElementById('applicationJobTitle').textContent = jobTitle;
            document.getElementById('applicationCompany').textContent = company;

            var statusClass =
                status === 'Selected' ? 'badge-selected' :
                    status === 'Rejected' ? 'badge-rejected' :
                        status === 'Under Review' ? 'badge-pending' : 'badge-applied';

            var statusIcon =
                status === 'Selected' ? 'fa-check-circle' :
                    status === 'Rejected' ? 'fa-times-circle' :
                        status === 'Under Review' ? 'fa-clock' : 'fa-paper-plane';

            var el = document.getElementById('applicationStatus');
            el.className = 'badge ' + statusClass;
            el.innerHTML = '<i class="fas ' + statusIcon + '"></i> ' + status;

            var modal = new bootstrap.Modal(document.getElementById('applicationDetailsModal'));
            modal.show();
        });
    });

    // ===============================
    // Company Details (Student) — premium + company name in title
    // NO status badge + NO registered date
    // ===============================
    document.querySelectorAll(".view-company-details").forEach(function (button) {
        button.addEventListener("click", function () {
            const slug = this.dataset.slug;

            const modalEl = document.getElementById("companyDetailsModal");
            const modal = new bootstrap.Modal(modalEl);

            modal.show();
            setCompanyLoadingStateStudent();
            hideStudentCompanyHeaderBits();

            fetch(`/placement_cell/company-detail/${slug}/`)
                .then(res => res.json())
                .then(response => {
                    if (!response || !response.success) {
                        showCompanyErrorStateStudent(response && response.error ? response.error : null);
                        return;
                    }

                    const data = response.data || {};

                    // FIXED TITLE
                    const titleEl = document.getElementById("companyDetailsModalLabel");
                    if (titleEl) {
                        titleEl.innerHTML = `<i class="fas fa-building me-2 text-accent"></i>Company Details`;
                    }

                    // Company Name (below title)
                    const nameEl = document.getElementById("companyNameHeader");
                    if (nameEl) {
                        nameEl.innerText = safeText(data.company_name) || "N/A";
                    }

                    const vacancyEl = document.getElementById("companyVacancy");
                    if (vacancyEl) vacancyEl.innerText = safeText(data.vacancies) || "N/A";

                    // Header chips
                    const industryEl = document.getElementById("companyIndustry");
                    const sizeEl = document.getElementById("companySize");
                    if (industryEl) industryEl.innerText = safeText(data.industry) || "N/A";
                    if (sizeEl) sizeEl.innerText = safeText(data.company_size) || "N/A";

                    // Body
                    fillCompanyDetailsStudent(data);
                })
                .catch(err => {
                    console.error(err);
                    showCompanyErrorStateStudent("Network error");
                });
        });
    });

    function hideStudentCompanyHeaderBits() {
        // hide Registered pill (whole chip)
        const createdAtEl = document.getElementById("companyCreatedAt");
        if (createdAtEl && createdAtEl.closest(".cd-date-pill")) {
            createdAtEl.closest(".cd-date-pill").style.display = "none";
        }
        // hide status badge if exists
        const statusBadge = document.getElementById("companyStatusBadge");
        if (statusBadge) statusBadge.classList.add("d-none");
    }

    function setCompanyLoadingStateStudent() {
        const sk = (w = "col-12") => `<span class="placeholder ${w}"></span>`;

        const industryEl = document.getElementById("companyIndustry");
        const sizeEl = document.getElementById("companySize");
        if (industryEl) industryEl.innerHTML = sk("col-4");
        if (sizeEl) sizeEl.innerHTML = sk("col-3");

        const contentEl = document.getElementById("companyDetailsContent");
        if (!contentEl) return;

        contentEl.innerHTML = `
      <div class="cd-grid">
        <div class="cd-card"><div class="cd-card-h">${sk("col-6")}</div><div class="cd-card-b">${sk("col-10")}<br>${sk("col-8")}<br>${sk("col-9")}</div></div>
        <div class="cd-card"><div class="cd-card-h">${sk("col-6")}</div><div class="cd-card-b">${sk("col-9")}<br>${sk("col-7")}<br>${sk("col-8")}</div></div>
        <div class="cd-card"><div class="cd-card-h">${sk("col-6")}</div><div class="cd-card-b">${sk("col-8")}<br>${sk("col-9")}</div></div>
        <div class="cd-card"><div class="cd-card-h">${sk("col-6")}</div><div class="cd-card-b">${sk("col-9")}<br>${sk("col-7")}</div></div>
        <div class="cd-card cd-span-2"><div class="cd-card-h">${sk("col-6")}</div><div class="cd-card-b">${sk("col-12")}<br>${sk("col-11")}<br>${sk("col-10")}</div></div>
      </div>
    `;
    }

    function showCompanyErrorStateStudent(msg) {
        const content = document.getElementById("companyDetailsContent");
        if (!content) return;

        content.innerHTML = `
      <div class="alert alert-danger mb-0">
        <i class="fas fa-triangle-exclamation me-2"></i>
        ${escapeHtml(msg || "Failed to load company details.")}
      </div>
    `;
    }

    function fillCompanyDetailsStudent(data) {
        const has = (v) => (v !== undefined && v !== null && String(v).trim() !== "");
        const t = (v) => has(v) ? v : `<span class="text-muted">N/A</span>`;
        const link = (href, label) => {
            if (!has(href)) return `<span class="text-muted">N/A</span>`;
            const show = label || href;
            return `<a href="${href}" target="_blank" rel="noopener">${show}</a>`;
        };

        document.getElementById("companyDetailsContent").innerHTML = `
      <div class="cd-grid">
        <div class="cd-card">
          <div class="cd-card-h"><i class="fas fa-building me-2 text-accent"></i>Company Info</div>
          <div class="cd-card-b">
            <div class="cd-row"><div class="cd-k">Company</div><div class="cd-v">${t(data.company_name)}</div></div>
            <div class="cd-row"><div class="cd-k">Industry</div><div class="cd-v">${t(data.industry)}</div></div>
            <div class="cd-row"><div class="cd-k">Website</div><div class="cd-v">${link(data.website, t(data.website))}</div></div>
            <div class="cd-row"><div class="cd-k">Company Size</div><div class="cd-v">${t(data.company_size)}</div></div>
          </div>
        </div>

        <div class="cd-card">
          <div class="cd-card-h"><i class="fas fa-user me-2 text-accent"></i>Contact Info</div>
          <div class="cd-card-b">
            <div class="cd-row"><div class="cd-k">Company Email</div><div class="cd-v">${has(data.company_email) ? `<a href="mailto:${data.company_email}">${data.company_email}</a>` : `<span class="text-muted">N/A</span>`}</div></div>
            <div class="cd-row"><div class="cd-k">Phone</div><div class="cd-v">${has(data.phone) ? `<a href="tel:${data.phone}">${data.phone}</a>` : `<span class="text-muted">N/A</span>`}</div></div>
            <div class="cd-row"><div class="cd-k">Contact Person</div><div class="cd-v">${t(data.contact_person_name)}</div></div>
            <div class="cd-row"><div class="cd-k">Designation</div><div class="cd-v">${t(data.designation)}</div></div>
          </div>
        </div>

        <div class="cd-card">
          <div class="cd-card-h"><i class="fas fa-address-book me-2 text-accent"></i>Contact Details</div>
          <div class="cd-card-b">
            <div class="cd-row"><div class="cd-k">Contact Email</div><div class="cd-v">${has(data.contact_email) ? `<a href="mailto:${data.contact_email}">${data.contact_email}</a>` : `<span class="text-muted">N/A</span>`}</div></div>
            <div class="cd-row"><div class="cd-k">Contact Phone</div><div class="cd-v">${has(data.contact_phone) ? `<a href="tel:${data.contact_phone}">${data.contact_phone}</a>` : `<span class="text-muted">N/A</span>`}</div></div>
          </div>
        </div>

        <div class="cd-card">
          <div class="cd-card-h"><i class="fas fa-file-alt me-2 text-accent"></i>Documents</div>
          <div class="cd-card-b">
            <div class="cd-row"><div class="cd-k">Certificate</div><div class="cd-v">${has(data.certificate_url) ? `<a href="${data.certificate_url}" target="_blank" rel="noopener">View</a>` : `<span class="text-muted">N/A</span>`}</div></div>
          </div>
        </div>

        <div class="cd-card cd-span-2">
          <div class="cd-card-h"><i class="fas fa-align-left me-2 text-accent"></i>Description</div>
          <div class="cd-card-b cd-pre">${t(data.description)}</div>
        </div>

        <div class="cd-card cd-span-2">
          <div class="cd-card-h"><i class="fas fa-map-marker-alt me-2 text-accent"></i>Address</div>
          <div class="cd-card-b cd-pre">${t(data.address)}</div>
        </div>
      </div>
    `;
    }

});

// ===============================
// Job Details (PC) (add this in pc_Dashbord.js)
// ===============================
document.addEventListener("click", async function (e) {
    const button = e.target.closest(".view-job-details");
    if (!button) return;

    const jobId = button.dataset.id;

    const modalEl = document.getElementById("jobDetailsModal");
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);

    modal.show();
    setLoadingState();

    try {
        const res = await fetch(`/jobs/job-detail/${jobId}/`);
        if (!res.ok) throw new Error("Network error");

        const result = await res.json();
        if (!result.success) throw new Error("Invalid response");

        fillJobDetails(result.data);
    } catch (err) {
        showErrorState();
        console.error(err);
    }
});

function setLoadingState() {
    const skeleton = (w = "col-12") => `<span class="placeholder ${w}"></span>`;

    document.getElementById("jobDetailsTitle").innerHTML = skeleton("col-7");
    document.getElementById("jobDetailsCompany").innerHTML = skeleton("col-5");
    document.getElementById("jobDetailsLocation").innerHTML = skeleton("col-4");

    document.getElementById("jobDetailsTypeText").innerHTML = skeleton("col-4");
    document.getElementById("jobDetailsSkills").innerHTML = skeleton("col-9");
    document.getElementById("jobDetailsEligibility").innerHTML = skeleton("col-8");
    document.getElementById("jobDetailsSalary").innerHTML = skeleton("col-5");
    document.getElementById("jobDetailsVacancies").innerHTML = skeleton("col-3");
    document.getElementById("jobDetailsStartDate").innerHTML = skeleton("col-4");
    document.getElementById("jobDetailsLastDate").innerHTML = skeleton("col-4");
    document.getElementById("jobDetailsSelection").innerHTML = skeleton("col-9");
    document.getElementById("jobDetailsDescription").innerHTML =
        `<div class="placeholder-glow">${skeleton("col-12")}<br>${skeleton("col-11")}<br>${skeleton("col-10")}</div>`;

    const pdfBtn = document.getElementById("jobDetailsPdf");
    if (pdfBtn) pdfBtn.classList.add("d-none");

    const msg = document.getElementById("jobDetailsStateMsg");
    if (msg) msg.classList.add("d-none");
}

function fillJobDetails(data) {
    const pick = (...keys) => {
        for (const k of keys) {
            const v = data && data[k];
            if (v !== undefined && v !== null && String(v).trim() !== "") return v;
        }
        return null;
    };

    const title = pick("job_title", "title") || "-";
    const company = pick("company_name", "company") || "-";
    const type = pick("job_type", "type") || "-";
    const formattedType = type.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());

    const desc = pick("description") || "-";
    const skills = pick("skills") || "-";
    const eligibility = pick("eligibility") || "-";
    const salary = pick("salary") || "-";
    const vacancies = pick("vacancies") ?? "-";
    const location = pick("location") || "-";
    const selection = pick("selection_process") || "-";
    const startDate = pick("start_date") || "-";
    const lastDate = pick("last_date") || "-";
    const pdf = pick("job_pdf", "pdf");

    document.getElementById("jobDetailsTitle").innerText = title;
    document.getElementById("jobDetailsCompany").innerText = company;
    document.getElementById("jobDetailsTypeText").innerText = formattedType;

    document.getElementById("jobDetailsSalary").innerText = salary;
    document.getElementById("jobDetailsVacancies").innerText = String(vacancies);
    document.getElementById("jobDetailsLocation").innerText = location;
    document.getElementById("jobDetailsSkills").innerText = skills;
    document.getElementById("jobDetailsEligibility").innerText = eligibility;
    document.getElementById("jobDetailsSelection").innerText = selection;
    document.getElementById("jobDetailsStartDate").innerText = startDate;
    document.getElementById("jobDetailsLastDate").innerText = lastDate;
    document.getElementById("jobDetailsDescription").innerText = desc;

    const pdfBtn = document.getElementById("jobDetailsPdf");
    if (pdfBtn) {
        if (pdf) {
            pdfBtn.href = pdf;
            pdfBtn.classList.remove("d-none");
        } else {
            pdfBtn.classList.add("d-none");
        }
    }

    const msg = document.getElementById("jobDetailsStateMsg");
    if (msg) msg.classList.add("d-none");
}

function showErrorState() {
    const titleEl = document.getElementById("jobDetailsTitle");
    if (titleEl) titleEl.innerText = "Failed to load job details";

    const msg = document.getElementById("jobDetailsStateMsg");
    if (msg) {
        msg.classList.remove("d-none");
        msg.innerHTML = `<i class="fas fa-triangle-exclamation me-2"></i>Something went wrong. Please try again.`;
    }
}
document.addEventListener("hidden.bs.modal", function () {

    // 🔥 remove leftover backdrop
    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());

    // 🔥 remove body blur/scroll lock
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
});