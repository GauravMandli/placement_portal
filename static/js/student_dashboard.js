

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
    // Apply button control (LISTING PAGE)
    // ===============================
    document.querySelectorAll('.apply-job-btn').forEach(function (btn) {

        const status = btn.getAttribute('data-status');

        // 🟡 UPCOMING
        if (status === "UPCOMING") {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-clock me-2"></i>Not Started';
            btn.classList.remove("btn-primary");
            btn.classList.add("btn-secondary");
            btn.style.cursor = "not-allowed";
        }

        // 🔴 EXPIRED
        else if (status === "EXPIRED") {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-ban me-2"></i>Expired';
            btn.classList.remove("btn-primary");
            btn.classList.add("btn-secondary");
            btn.style.cursor = "not-allowed";
        }

    });

    // ===============================
    // Apply Job Confirmation
    // ===============================
    // document.querySelectorAll('.apply-job-btn').forEach(function (btn) {
    //     btn.addEventListener('click', function (e) {
    //         e.preventDefault();
    //         var jobTitle = this.getAttribute('data-job-title');
    //         document.getElementById('confirmJobTitle').textContent = jobTitle;
    //         var modal = new bootstrap.Modal(document.getElementById('applyJobModal'));
    //         modal.show();
    //     });
    // });

    // ===============================
    // Apply Job (FINAL)
    // ===============================

    let selectedJobId = null;

    // CLICK APPLY
    document.querySelectorAll('.apply-job-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            // ❌ disabled hoy to kai na karvu
            if (this.disabled) return;
            selectedJobId = this.getAttribute('data-id');

            const jobTitle = this.getAttribute('data-job-title');
            document.getElementById('confirmJobTitle').textContent = jobTitle;

            const modal = new bootstrap.Modal(document.getElementById('applyJobModal'));
            modal.show();
        });
    });




    const confirmApplyBtn = document.getElementById('confirmApplyBtn');

    if (confirmApplyBtn) {
        confirmApplyBtn.addEventListener('click', function () {

            const btn = this;

            if (btn.classList.contains('btn-loading')) return;

            btn.classList.add('btn-loading');
            btn.disabled = true;

            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Submitting...';

            fetch(`/students/apply-job/${selectedJobId}/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                }
            })
                .then(res => res.json())
                .then(data => {

                    if (data.success) {
                        showToast("Application Submitted", "success");

                        document.querySelectorAll(`.apply-job-btn[data-id="${selectedJobId}"]`)
                            .forEach(btn => {
                                btn.innerHTML = "Applied";
                                btn.classList.remove("btn-primary");
                                btn.classList.add("btn-success");
                                btn.disabled = true;
                            });
                        document.querySelectorAll(`.job-card-item`).forEach(card => {
                            if (card.querySelector(`.apply-job-btn[data-id="${selectedJobId}"]`)) {
                                card.remove();   // 🔥 remove card instantly
                            }
                        });

                    } else {
                        showToast(data.message, "danger");
                    }

                })
                .finally(() => {
                    btn.classList.remove('btn-loading');
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;

                    bootstrap.Modal.getInstance(document.getElementById('applyJobModal')).hide();
                });

        });
    }


    // CSRF helper
    function getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }


    // // Confirm Apply (with loading spinner)
    // var confirmApplyBtn = document.getElementById('confirmApplyBtn');
    // if (confirmApplyBtn) {
    //     confirmApplyBtn.addEventListener('click', function () {
    //         var btn = this;
    //         if (btn.classList.contains('btn-loading')) return;

    //         btn.classList.add('btn-loading');
    //         btn.disabled = true;

    //         var originalHtml = btn.innerHTML;
    //         btn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Submitting...';

    //         setTimeout(function () {
    //             btn.classList.remove('btn-loading');
    //             btn.disabled = false;
    //             btn.innerHTML = originalHtml;

    //             if (typeof showToast === 'function') showToast('Application Submitted', 'success');
    //             else alert('Application Submitted');

    //             bootstrap.Modal.getInstance(document.getElementById('applyJobModal')).hide();
    //         }, 1500);
    //     });
    // }


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
// Job Details (OUTSIDE DOMContentLoaded)
// ===============================
document.addEventListener("click", async function (e) {
    const button = e.target.closest(".view-job-details");
    if (!button) return;

    const jobId = button.dataset.id;

    const modalEl = document.getElementById("jobDetailsModal");
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
    const pdfZipBtn = document.getElementById("jobDetailsPdfZip");
    if (pdfZipBtn) pdfZipBtn.classList.add("d-none");
    const pdfList = document.getElementById("jobDetailsPdfList");
    if (pdfList) pdfList.innerHTML = "";

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
    const pdfs = Array.isArray(data?.pdfs) ? data.pdfs : [];
    const pdfZipUrl = pick("pdf_zip_url");

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
        if (pdfs.length > 0) {
            pdfBtn.href = pdfs[0].url;
            pdfBtn.classList.remove("d-none");
        } else if (pdf) {
            pdfBtn.href = pdf;
            pdfBtn.classList.remove("d-none");
        } else {
            pdfBtn.classList.add("d-none");
        }
    }

    const pdfZipBtn = document.getElementById("jobDetailsPdfZip");
    if (pdfZipBtn) {
        if (pdfs.length > 1 && pdfZipUrl) {
            pdfZipBtn.href = pdfZipUrl;
            pdfZipBtn.classList.remove("d-none");
        } else {
            pdfZipBtn.classList.add("d-none");
        }
    }

    const pdfList = document.getElementById("jobDetailsPdfList");
    if (pdfList) {
        if (pdfs.length > 0) {
            const listItems = pdfs.map((item, index) => {
                const name = item?.name || `PDF ${index + 1}`;
                const url = item?.url || "#";
                return `<a href="${url}" target="_blank" rel="noopener" class="me-3">View ${name}</a>`;
            }).join("");
            pdfList.innerHTML = `<i class="fas fa-paperclip me-1"></i>${listItems}`;
        } else if (pdf) {
            pdfList.innerHTML = `<i class="fas fa-paperclip me-1"></i><a href="${pdf}" target="_blank" rel="noopener">View attached PDF</a>`;
        } else {
            pdfList.innerHTML = "";
        }
    }

    const msg = document.getElementById("jobDetailsStateMsg");
    if (msg) msg.classList.add("d-none");

    const applyBtn = document.getElementById("jobDetailsApplyBtn");

    if (applyBtn) {

        // RESET (very important)
        applyBtn.style.display = "inline-block";
        applyBtn.disabled = false;
        applyBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Apply Now';
        applyBtn.classList.remove("btn-secondary");
        applyBtn.classList.add("btn-primary");

        // 🔴 EXPIRED
        if (data.dynamic_status === "EXPIRED") {
            applyBtn.disabled = true;
            applyBtn.innerHTML = '<i class="fas fa-ban me-2"></i>Expired';
            applyBtn.classList.remove("btn-primary");
            applyBtn.classList.add("btn-secondary");
            applyBtn.style.cursor = "not-allowed";
        }

        // 🟡 UPCOMING
        else if (data.dynamic_status === "UPCOMING") {
            applyBtn.disabled = true;
            applyBtn.innerHTML = '<i class="fas fa-clock me-2"></i>Not Started';
            applyBtn.classList.remove("btn-primary");
            applyBtn.classList.add("btn-secondary");
            applyBtn.style.cursor = "not-allowed";
        }

        // 🟢 OPEN
        else {
            applyBtn.disabled = false;
            applyBtn.style.cursor = "pointer";
        }
    }
}

function showErrorState() {
    document.getElementById("jobDetailsTitle").innerText = "Failed to load job details";
    const msg = document.getElementById("jobDetailsStateMsg");
    if (msg) {
        msg.classList.remove("d-none");
        msg.innerHTML = `<i class="fas fa-triangle-exclamation me-2"></i>Something went wrong. Please try again.`;
    }
}


// interview details
// 🔥 Global click listener (event delegation)
document.addEventListener("click", async function (e) {

    // 🎯 Target button find (even if child element clicked)
    const btn = e.target.closest("button.view-interview-details");
    if (!btn) return; // ignore other clicks

    // 📌 Safely get data attributes
    const appId = btn.dataset.appId;
    const jobTitle = btn.dataset.jobTitle;


    // ⚠️ Validation: appId required
    if (!appId) {
        alert("Application ID missing!");
        return;
    }

    // 🏷️ Set modal title
    document.getElementById("modalJobTitle").innerText = jobTitle || "-";

    // 🔄 Helper function: safe text update
    const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    // ⏳ Reset UI with loading state
    setText("viewStudent", "Loading...");
    setText("viewDate", "Loading...");
    setText("viewTime", "Loading...");
    setText("viewMode", "Loading...");
    setText("viewRemarks", "Loading...");

    // 🙈 Hide optional sections initially
    document.getElementById("viewLinkBox").style.display = "none";
    document.getElementById("viewAddressBox").style.display = "none";

    try {
        // 🌐 Fetch interview details from backend
        const res = await fetch(`/students/interview-details/${appId}/`);
        const result = await res.json();

        // 🔥 IMPORTANT CHANGE
        if (!result.success || !result.data.length) {
            throw new Error("No data");
        }



        const item = result.data[0];

        // 🧾 Fill modal data
        setText("viewStudent", item.student_name || "-");
        setText("viewDate", item.date || "-");
        setText("viewTime", item.time || "-");
        setText("viewMode", item.mode || "-");
        setText("viewRemarks", item.remarks || "—");

        // 🎯 Mode-based UI handling
        if (item.mode === "ONLINE") {

            // 🌐 Show meeting link
            document.getElementById("viewLinkBox").style.display = "block";
            document.getElementById("viewAddressBox").style.display = "none";

            const link = document.getElementById("viewLink");
            link.href = item.meeting_link || "#";
            link.innerText = item.meeting_link || "No link provided";

        } else {

            // 🏢 Show address
            document.getElementById("viewLinkBox").style.display = "none";
            document.getElementById("viewAddressBox").style.display = "block";

            setText("viewAddress", item.address || "No address provided");
        }

    } catch (err) {
        // ❌ Error handling (network / server / empty data)
        console.error("Interview Fetch Error:", err);

        setText("viewStudent", "-");
        setText("viewDate", "-");
        setText("viewTime", "-");
        setText("viewMode", "-");
        setText("viewRemarks", "Failed to load interview details");

        document.getElementById("viewLinkBox").style.display = "none";
        document.getElementById("viewAddressBox").style.display = "none";
    }

    // 📦 Show Bootstrap modal
    const modalEl = document.getElementById("interviewDetailsModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
});


setTimeout(() => {
    document.querySelectorAll('.toast').forEach(toast => {
        toast.style.display = 'none';
    });
}, 3000);





// document.addEventListener("DOMContentLoaded", function () {
//     const verifyDetailsBtn = document.getElementById("verifyDetailsBtn");
//     const alternativePasswordFields = document.getElementById("alternativePasswordFields");
//     const forgotPasswordAlternativeForm = document.getElementById("forgotPasswordAlternativeForm");
//     const studentForgotPasswordModal = document.getElementById("studentForgotPasswordModal");

//     if (verifyDetailsBtn) {
//         verifyDetailsBtn.addEventListener("click", function () {
//             const enrollNo = document.getElementById("forgotEnrollNo").value.trim();
//             const dob = document.getElementById("forgotDob").value;

//             if (!enrollNo || !dob) {
//                 alert("Please enter Enrollment Number and Date of Birth.");
//                 return;
//             }
//             alternativePasswordFields.classList.remove("d-none");
//         });
//     }

//     if (forgotPasswordAlternativeForm) {
//         forgotPasswordAlternativeForm.addEventListener("submit", function (event) {
//             event.preventDefault();
//             alert("Password reset confirmed.");
//         });
//     }

//     if (studentForgotPasswordModal) {
//         studentForgotPasswordModal.addEventListener("hidden.bs.modal", function () {
//             alternativePasswordFields.classList.add("d-none");
//             forgotPasswordAlternativeForm.reset();
//         });
//     }
// });

