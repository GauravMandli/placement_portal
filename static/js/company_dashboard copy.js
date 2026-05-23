let currentAppId = null;

document.addEventListener("click", async function (e) {

    const btn = e.target.closest(".view-student-details-btn");
    if (!btn) return;

    const studentId = btn.dataset.studentId;

    const modalEl = document.getElementById("studentProfileModal");
    const modal = new bootstrap.Modal(modalEl);

    modal.show();

    try {
        const res = await fetch(`/company/student-details/${studentId}/`);
        if (!res.ok) throw new Error("Network error");

        const result = await res.json();

        if (!result.success) {
            alert("Failed to load student");
            return;
        }

        const data = result.data;

        // 🔹 TEXT
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value || "-";
        };

        setText("profileStudentName", data.name);
        setText("profileStudentGender", data.gender);
        setText("profileStudentDob", data.dob);
        setText("profileStudentEnrollNumber", data.enroll);
        setText("profileStudentEmail", data.email);
        setText("profileStudentPhone", data.phone);
        setText("profileStudentCgpa", data.cgpa);
        setText("profileStudentBranch", data.branch);
        setText("profileStudentYear", data.year);
        setText("profileStudentSkills", data.skills);

        // 📸 PHOTO (IMPORTANT FIX)
        const photo = document.getElementById("profileStudentPhoto");
        if (photo) {
            if (data.photo) {
                photo.src = data.photo;
                photo.style.display = "block";
            } else {
                photo.style.display = "none";
            }
        }

        // 🔗 LINKS
        const setLink = (id, value) => {
            const el = document.getElementById(id);
            if (!el) return;

            if (value) {
                el.href = value;
                el.innerText = value;
                el.style.display = "inline";
            } else {
                el.style.display = "none";
            }
        };

        setLink("profileStudentLinkedin", data.linkedin);
        setLink("profileStudentGithub", data.github);
        setLink("profileStudentPortfolio", data.portfolio);

        // 📄 RESUME
        const resume = document.getElementById("profileStudentResumeLink");
        if (resume) {
            if (data.resume) {
                resume.href = data.resume;
                resume.style.display = "inline-block";
            } else {
                resume.style.display = "none";
            }
        }

    } catch (err) {
        console.error(err);
        alert("Something went wrong!");
    }
});


document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".status-btn");
    if (!btn) return;

    if (btn.disabled) return;

    const { id: appId, status, url } = btn.dataset;

    if (!appId || !status || !url) {
        console.error("Missing required data attributes");
        return;
    }

    const originalText = btn.innerHTML;

    try {
        // 🔹 Disable button + loading UI
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Updating`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken(),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                app_id: appId,
                status: status
            })
        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Update failed");
        }

        // ✅ SIMPLE + SAFE (reload)
        location.reload();

    } catch (error) {
        console.error(error);
        showToast(error.message || "Something went wrong", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});


// 🔐 CSRF helper (best practice)
function getCSRFToken() {
    const cookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="));

    return cookie ? cookie.split("=")[1] : "";
}


// 🔔 Toast (optional but pro UI)
function showToast(message, type = "info") {
    alert(message); // 👉 later replace with toast UI
}

// ===============================
// 💼 COMPANY - JOB DETAILS (AJAX)
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

        if (!result.success) {
            throw new Error("Invalid response");
        }

        fillJobDetails(result.data);

    } catch (err) {
        console.error(err);
        showErrorState();
    }
});


// ===============================
// 🔄 Loading State
// ===============================
function setLoadingState() {
    const skeleton = (w = "col-12") => `<span class="placeholder ${w}"></span>`;

    document.getElementById("jobDetailsTitle").innerHTML = skeleton("col-6");
    document.getElementById("jobDetailsCompany").innerHTML = skeleton("col-4");
    document.getElementById("jobDetailsLocation").innerHTML = skeleton("col-4");

    document.getElementById("jobDetailsSalary").innerHTML = skeleton("col-3");
    document.getElementById("jobDetailsVacancies").innerHTML = skeleton("col-2");
    document.getElementById("jobDetailsTypeText").innerHTML = skeleton("col-3");

    document.getElementById("jobDetailsStartDate").innerHTML = skeleton("col-3");
    document.getElementById("jobDetailsLastDate").innerHTML = skeleton("col-3");

    document.getElementById("jobDetailsSkills").innerHTML = skeleton("col-8");
    document.getElementById("jobDetailsEligibility").innerHTML = skeleton("col-8");
    document.getElementById("jobDetailsSelection").innerHTML = skeleton("col-8");

    document.getElementById("jobDetailsDescription").innerHTML =
        `<div class="placeholder-glow">${skeleton("col-12")}<br>${skeleton("col-10")}</div>`;

    const pdfBtn = document.getElementById("jobDetailsPdf");
    if (pdfBtn) pdfBtn.classList.add("d-none");
}


// ===============================
// ✅ Fill Data
// ===============================
function fillJobDetails(data) {

    document.getElementById("jobDetailsTitle").innerText = data.title || "-";
    document.getElementById("jobDetailsCompany").innerText = data.company || "-";
    document.getElementById("jobDetailsLocation").innerText = data.location || "-";

    document.getElementById("jobDetailsSalary").innerText = data.salary || "-";
    document.getElementById("jobDetailsVacancies").innerText = data.vacancies || "-";
    document.getElementById("jobDetailsTypeText").innerText = data.type || "-";

    document.getElementById("jobDetailsStartDate").innerText = data.start_date || "-";
    document.getElementById("jobDetailsLastDate").innerText = data.last_date || "-";

    document.getElementById("jobDetailsSkills").innerText = data.skills || "-";
    document.getElementById("jobDetailsEligibility").innerText = data.eligibility || "-";
    document.getElementById("jobDetailsSelection").innerText = data.selection_process || "-";

    document.getElementById("jobDetailsDescription").innerText = data.description || "-";

    // 📄 PDF
    const pdfBtn = document.getElementById("jobDetailsPdf");
    if (pdfBtn) {
        if (data.pdf) {
            pdfBtn.href = data.pdf;
            pdfBtn.classList.remove("d-none");
        } else {
            pdfBtn.classList.add("d-none");
        }
    }
}


// ===============================
// ❌ Error State
// ===============================
function showErrorState() {
    document.getElementById("jobDetailsTitle").innerText = "Failed to load job details";
}

// ===============================
// 🎯 INTERVIEW SCHEDULE MODAL OPEN
// ===============================

document.addEventListener("click", function (e) {

    const btn = e.target.closest(".action-select");
    if (!btn) return;   //first check

    currentAppId = btn.dataset.id; // then use


    // 🔹 Extract data safely
    const data = {
        studentName: btn.dataset.studentName || "-",
        jobTitle: btn.dataset.jobTitle || "-",
        studentId: btn.dataset.studentId || "",
        jobId: btn.dataset.jobId || ""
    };

    // 🔹 Helper function
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    };

    // 🔹 Fill modal data
    setText("scheduleStudentName", data.studentName);
    setText("scheduleJobTitle", data.jobTitle);

    setValue("scheduleStudentId", data.studentId);
    setValue("scheduleJobId", data.jobId);

    // 🔹 Get modal
    const modalEl = document.getElementById("interviewScheduleModal");

    if (!modalEl) {
        console.error("Interview modal not found!");
        return;
    }

    // 🔹 Reuse modal instance
    let modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) {
        modal = new bootstrap.Modal(modalEl);
    }

    modal.show();
});




// ===============================
// 🚀 SCHEDULE INTERVIEW (PRO)
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const scheduleBtn = document.getElementById("confirmScheduleBtn");

    if (scheduleBtn) {
        scheduleBtn.addEventListener("click", handleScheduleInterview);
    }


    async function handleScheduleInterview() {
        const formData = getFormData();

        if (!validateForm(formData)) return;

        toggleButtonState(true);

        try {
            const response = await sendScheduleRequest(formData);
            handleSuccess(response);
        } catch (error) {
            handleError(error);
        } finally {
            toggleButtonState(false);
        }
    }

});

// ===============================
// 📥 GET FORM DATA
// ===============================
function getFormData() {
    return {
        app_id: currentAppId,
        date: document.getElementById("interviewDate").value.trim(),
        time: document.getElementById("interviewTime").value.trim(),
        mode: document.getElementById("interviewMode").value,
        meeting_link: document.getElementById("meetingLink").value.trim(),
        address: document.getElementById("interviewAddress").value.trim(),
        remarks: document.getElementById("interviewRemarks").value.trim()
    };
}

// ===============================
// ✅ VALIDATION
// ===============================
function validateForm(data) {
    if (!data.date || !data.time || !data.mode) {
        showToast("Please fill all required fields", "error");
        return false;
    }

    if (data.mode === "ONLINE" && !data.meeting_link) {
        showToast("Meeting link is required for online interviews", "error");
        return false;
    }

    if (data.mode === "OFFLINE" && !data.address) {
        showToast("Address is required for offline interviews", "error");
        return false;
    }

    return true;
}

// ===============================
// 🌐 API CALL
// ===============================
async function sendScheduleRequest(data) {
    const response = await fetch("/company/schedule-interview/", {
        method: "POST",
        headers: {
            "X-CSRFToken": getCSRFToken(),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(data)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to schedule interview");
    }

    return result;
}

// ===============================
// 🎉 SUCCESS HANDLER
// ===============================
function handleSuccess() {
    showToast("Interview scheduled successfully ✅", "success");

    // Better UX than reload
    setTimeout(() => {
        window.location.reload();
    }, 1200);
}

// ===============================
// ❌ ERROR HANDLER
// ===============================
function handleError(error) {
    console.error("Schedule Error:", error);
    showToast(error.message, "error");
}

// ===============================
// 🔄 BUTTON LOADING STATE
// ===============================
function toggleButtonState(isLoading) {
    const btn = document.getElementById("confirmScheduleBtn");

    if (!btn) return;

    btn.disabled = isLoading;
    btn.innerHTML = isLoading
        ? "Scheduling..."
        : '<i class="fas fa-calendar-check me-1"></i>Schedule Interview';
}

// ===============================
// 🔔 TOAST (Replace alert)
// ===============================
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


document.addEventListener("DOMContentLoaded", function () {

    const modeSelect = document.getElementById("interviewMode");
    const meetingGroup = document.getElementById("meetingLinkGroup");
    const addressGroup = document.getElementById("interviewAddressGroup");

    if (!modeSelect) return;

    function toggleFields() {
        const mode = modeSelect.value;

        if (mode === "ONLINE") {
            meetingGroup.classList.remove("d-none");
            addressGroup.classList.add("d-none");
        }
        else if (mode === "OFFLINE") {
            meetingGroup.classList.add("d-none");
            addressGroup.classList.remove("d-none");
        }
        else {
            meetingGroup.classList.add("d-none");
            addressGroup.classList.add("d-none");
        }
    }

    modeSelect.addEventListener("change", toggleFields);

    toggleFields(); // initial call
});