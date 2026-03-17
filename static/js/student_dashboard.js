
document.addEventListener('DOMContentLoaded', function () {

            // document.querySelectorAll('.nav-link-dashboard').forEach(function(link) {
            //     link.addEventListener('click', function(e) {
            //         e.preventDefault();
            //         var pageId = this.getAttribute('data-page');
            //         if (pageId) {
            //             showPage(pageId);
            //             if (pageId === 'page-personal-details') {
            //                 var p = loadStudentProfile();
            //                 if (p) prefillPersonalDetailsForm(p);
            //             }
            //         }
            //     });
            // });

            // Job role filter
            var filterEl = document.getElementById('jobRoleFilter');
            if (filterEl) {
                filterEl.addEventListener('change', function() {
                    var role = this.value;
                    document.querySelectorAll('.job-card-item').forEach(function(card) {
                        var show = !role || card.getAttribute('data-role') === role;
                        card.style.display = show ? '' : 'none';
                    });
                });
            }

            // File drop zone (PDF only)
            var resumeDropZone = document.getElementById('resumeDropZone');
            var resumeUpload = document.getElementById('resumeUpload');
            var resumeFileName = document.getElementById('resumeFileName');
            if (resumeDropZone && resumeUpload) {
                resumeDropZone.addEventListener('click', function(e) {
                    if (e.target !== resumeUpload) resumeUpload.click();
                });
                resumeDropZone.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    resumeDropZone.classList.add('drag-over');
                });
                resumeDropZone.addEventListener('dragleave', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    resumeDropZone.classList.remove('drag-over');
                });
                resumeDropZone.addEventListener('drop', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    resumeDropZone.classList.remove('drag-over');
                    var files = e.dataTransfer && e.dataTransfer.files;
                    if (files && files.length) handleResumeFile(files[0]);
                });
                resumeUpload.addEventListener('change', function() {
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

            // Passport photo preview
            var passportPhotoInput = document.getElementById('studentPassportPhoto');
            var passportPhotoImg = document.getElementById('passportPhotoImg');
            var passportPhotoPlaceholder = document.getElementById('passportPhotoPlaceholder');
            if (passportPhotoInput && passportPhotoImg && passportPhotoPlaceholder) {
                passportPhotoInput.addEventListener('change', function() {
                    var file = this.files && this.files[0];
                    if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')) {
                        if (file.size > 500 * 1024) {
                            if (typeof showToast === 'function') showToast('Photo must be 500KB or less.', 'danger');
                            this.value = '';
                            return;
                        }
                        var reader = new FileReader();
                        reader.onload = function() {
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

            
            // View Job Details Modal
            document.querySelectorAll('.view-job-details').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var jobTitle = this.getAttribute('data-job-title');
                    var company = this.getAttribute('data-company');
                    var jobId = this.getAttribute('data-job-id');
                    
                    var jobDetails = {
                        1: { title: 'Python Developer', company: 'Tech Corp', type: 'Full Time', salary: '8-12 LPA', location: 'Bangalore', skills: 'Python, SQL, Django', eligibility: 'CGPA ≥ 7.5, Python, SQL', description: 'We are looking for a skilled Python Developer to join our team.' },
                        2: { title: 'Java Backend Developer', company: 'Innovate Ltd', type: 'Full Time', salary: '7-11 LPA', location: 'Mumbai', skills: 'Java, Spring, Hibernate', eligibility: 'CGPA ≥ 7.0, Java, Spring', description: 'Join our backend team to build scalable applications.' },
                        3: { title: 'Web Developer (React)', company: 'Cloud Solutions', type: 'Full Time', salary: '6-10 LPA', location: 'Hyderabad', skills: 'HTML/CSS, JavaScript, React', eligibility: 'CGPA ≥ 7.0, HTML/CSS, JavaScript, React', description: 'Frontend developer position focusing on React applications.' }
                    };
                    
                    var details = jobDetails[jobId] || { title: jobTitle, company: company, type: 'Full Time', salary: 'Competitive', location: 'Multiple', skills: 'Various', eligibility: 'As per requirements', description: 'Job details available upon application.' };
                    
                    document.getElementById('jobDetailsTitle').textContent = details.title;
                    document.getElementById('jobDetailsCompany').textContent = details.company;
                    document.getElementById('jobDetailsType').textContent = details.type;
                    document.getElementById('jobDetailsSalary').textContent = details.salary;
                    document.getElementById('jobDetailsLocation').textContent = details.location;
                    document.getElementById('jobDetailsSkills').textContent = details.skills;
                    document.getElementById('jobDetailsEligibility').textContent = details.eligibility;
                    document.getElementById('jobDetailsDescription').textContent = details.description;
                    
                    var modal = new bootstrap.Modal(document.getElementById('jobDetailsModal'));
                    modal.show();
                });
            });

            // Apply Job Confirmation
            document.querySelectorAll('.apply-job-btn').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    var jobTitle = this.getAttribute('data-job-title');
                    document.getElementById('confirmJobTitle').textContent = jobTitle;
                    var modal = new bootstrap.Modal(document.getElementById('applyJobModal'));
                    modal.show();
                });
            });

            // Confirm Apply (with loading spinner)
            document.getElementById('confirmApplyBtn').addEventListener('click', function() {
                var btn = this;
                if (btn.classList.contains('btn-loading')) return;
                btn.classList.add('btn-loading');
                btn.disabled = true;
                var originalHtml = btn.innerHTML;
                btn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Submitting...';
                setTimeout(function() {
                    btn.classList.remove('btn-loading');
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                    if (typeof showToast === 'function') {
                        showToast('Application Submitted', 'success');
                    } else {
                        alert('Application Submitted');
                    }
                    bootstrap.Modal.getInstance(document.getElementById('applyJobModal')).hide();
                }, 1500);
            });

            // View Application Details
            document.querySelectorAll('.view-application-details').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var jobTitle = this.getAttribute('data-job-title');
                    var company = this.getAttribute('data-company');
                    var status = this.getAttribute('data-status');
                    
                    document.getElementById('applicationJobTitle').textContent = jobTitle;
                    document.getElementById('applicationCompany').textContent = company;
                    document.getElementById('applicationStatus').textContent = status;
                    var statusClass = status === 'Selected' ? 'badge-selected' : status === 'Rejected' ? 'badge-rejected' : status === 'Under Review' ? 'badge-pending' : 'badge-applied';
                    var statusIcon = status === 'Selected' ? 'fa-check-circle' : status === 'Rejected' ? 'fa-times-circle' : status === 'Under Review' ? 'fa-clock' : 'fa-paper-plane';
                    var el = document.getElementById('applicationStatus');
                    el.className = 'badge ' + statusClass;
                    el.innerHTML = '<i class="fas ' + statusIcon + '"></i> ' + status;
                    
                    var modal = new bootstrap.Modal(document.getElementById('applicationDetailsModal'));
                    modal.show();
                });
            });

            
document.querySelectorAll(".view-company-details").forEach(function (button) {

    button.addEventListener("click", function () {

        const slug = this.dataset.slug;

        fetch(`/placement_cell/company-detail/${slug}/`)
            .then(res => res.json())
            .then(response => {

                if (!response.success) {
                    alert(response.error);
                    return;
                }

                const data = response.data;

                // status badge
                let statusBadge = "";
                if (data.status === "Approved") {
                    statusBadge = '<span class="badge bg-success">Approved</span>';
                } else if (data.status === "Pending") {
                    statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
                } else {
                    statusBadge = '<span class="badge bg-danger">Rejected</span>';
                }

                function val(v) {
    return v ? v : '<span class="text-muted">N/A</span>';
}

document.getElementById("companyDetailsContent").innerHTML = `
<div class="container-fluid">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
            <h5 class="fw-bold mb-1">${data.company_name}</h5>
            ${statusBadge}
        </div>
        <a href="${data.certificate_url || '#'}"
           class="btn btn-outline-primary btn-sm"
           target="_blank">
           <i class="fas fa-file-alt me-1"></i> Certificate
        </a>
    </div>

    <hr class="my-3">

    <div class="row g-4">

        <!-- Company Info -->
        <div class="col-md-6">
            <div class="card shadow-sm border-0 h-100 hover-card">
                <div class="card-body">
                    <h6 class="fw-semibold text-primary mb-3">
                        <i class="fas fa-building me-2"></i>Company Info
                    </h6>
                    <p><strong>Industry:</strong> ${val(data.industry)}</p>
                    <p><strong>Website:</strong> 
                        <a href="${data.website || '#'}" target="_blank">
                            ${val(data.website)}
                        </a>
                    </p>
                    <p><strong>Company Size:</strong> ${val(data.company_size)}</p>
                </div>
            </div>
        </div>

        <!-- Contact Info -->
        <div class="col-md-6">
            <div class="card shadow-sm border-0 h-100 hover-card">
                <div class="card-body">
                    <h6 class="fw-semibold text-primary mb-3">
                        <i class="fas fa-user me-2"></i>Contact Info
                    </h6>
                    <p><strong>Email:</strong> 
                        <a href="mailto:${data.company_email}">
                            ${val(data.company_email)}
                        </a>
                    </p>
                    <p><strong>Phone:</strong> 
                        <a href="tel:${data.phone}">
                            ${val(data.phone)}
                        </a>
                    </p>
                    <p><strong>Contact Person:</strong> ${val(data.contact_person_name)}</p>
                    <p><strong>Designation:</strong> ${val(data.designation)}</p>
                </div>
            </div>
        </div>

        <!-- Extra Info -->
        <div class="col-md-6">
            <div class="card shadow-sm border-0 h-100 hover-card">
                <div class="card-body">
                    <h6 class="fw-semibold text-primary mb-3">
                        <i class="fas fa-info-circle me-2"></i>Additional Info
                    </h6>
                    <p><strong>GST Number:</strong> ${val(data.gst_number)}</p>
                    <p><strong>Registered On:</strong> ${new Date(data.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        </div>

        <!-- Contact Extra -->
        <div class="col-md-6">
            <div class="card shadow-sm border-0 h-100 hover-card">
                <div class="card-body">
                    <h6 class="fw-semibold text-primary mb-3">
                        <i class="fas fa-address-book me-2"></i>Contact Details
                    </h6>
                    <p><strong>Email:</strong> ${val(data.contact_email)}</p>
                    <p><strong>Phone:</strong> ${val(data.contact_phone)}</p>
                </div>
            </div>
        </div>

        <!-- Description -->
        <div class="col-12">
            <div class="card border-0 bg-light shadow-sm">
                <div class="card-body">
                    <h6 class="fw-semibold text-primary mb-2">
                        <i class="fas fa-align-left me-2"></i>Description
                    </h6>
                    <p class="mb-0 small">${val(data.description)}</p>
                </div>
            </div>
        </div>

        <!-- Address -->
        <div class="col-12">
            <div class="card border-0 bg-light shadow-sm">
                <div class="card-body">
                    <h6 class="fw-semibold text-primary mb-2">
                        <i class="fas fa-map-marker-alt me-2"></i>Address
                    </h6>
                    <p class="mb-0 small">${val(data.address)}</p>
                </div>
            </div>
        </div>

    </div>
</div>
`;

                new bootstrap.Modal(
                    document.getElementById("companyDetailsModal")
                ).show();
            });

    });

});

});
                  

    setTimeout(function () {
        document.querySelectorAll('.alert').forEach(function (alert) {
            alert.classList.remove('show');
        });
    }, 3000);


