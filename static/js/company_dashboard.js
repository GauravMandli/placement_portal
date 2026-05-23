let currentAppId = null;

// ===============================
// 🔐 CSRF
// ===============================
function getCSRFToken() {
  const cookie = document.cookie
    .split("; ")
    .find(row => row.startsWith("csrftoken="));
  return cookie ? cookie.split("=")[1] : "";
}

// ===============================
// 🔔 TOAST
// ===============================
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===============================
// 👁️ VIEW STUDENT DETAILS
// ===============================
document.addEventListener("click", async function (e) {
  const btn = e.target.closest(".view-student-details-btn");
  if (!btn) return;

  const studentId = btn.dataset.studentId;

  const modalEl = document.getElementById("studentProfileModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  try {
    const res = await fetch(`/company/student-details/${studentId}/`);
    const result = await res.json();

    if (!result.success) throw new Error();

    const data = result.data;

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

    // photo
    const photo = document.getElementById("profileStudentPhoto");
    if (photo) {
      if (data.photo) {
        photo.src = data.photo;
        photo.style.display = "block";
      } else {
        photo.style.display = "none";
      }
    }

  } catch {
    showToast("Failed to load student", "error");
  }
});

// ===============================
// 🔄 STATUS UPDATE
// ===============================
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".status-btn");
  if (!btn) return;

  if (btn.disabled) return;

  const { id: appId, status, url } = btn.dataset;

  try {
    btn.disabled = true;
    btn.innerHTML = "Updating...";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCSRFToken(),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ app_id: appId, status })
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.error);

    location.reload();

  } catch (err) {
    showToast(err.message || "Error", "error");
  }
});

// ===============================
// 🎯 OPEN INTERVIEW MODAL
// ===============================
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".action-schedule");
  if (!btn) return;

  currentAppId = btn.dataset.id;

  document.getElementById("scheduleStudentName").innerText =
    btn.dataset.studentName;

  document.getElementById("scheduleJobTitle").innerText =
    btn.dataset.jobTitle;

  const modalEl = document.getElementById("interviewScheduleModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
});

// ===============================
// 🎯 MODE TOGGLE (ONLINE/OFFLINE)
// ===============================
document.addEventListener("change", function (e) {
  if (e.target.id !== "interviewMode") return;

  const mode = e.target.value;

  const meeting = document.getElementById("meetingLinkGroup");
  const address = document.getElementById("interviewAddressGroup");

  if (mode === "ONLINE") {
    meeting.classList.remove("d-none");
    address.classList.add("d-none");
  } else if (mode === "OFFLINE") {
    meeting.classList.add("d-none");
    address.classList.remove("d-none");
  }
});

// ===============================
// 🚀 SCHEDULE INTERVIEW CLICK
// ===============================
document.addEventListener("click", function (e) {
  const btn = e.target.closest("#confirmScheduleBtn");
  if (!btn) return;

  handleScheduleInterview();
});

// ===============================
// 📥 GET FORM DATA
// ===============================
function getFormData() {
  return {
    app_id: currentAppId,
    date: document.getElementById("interviewDate").value,
    time: document.getElementById("interviewTime").value,
    mode: document.getElementById("interviewMode").value,
    meeting_link: document.getElementById("meetingLink").value,
    address: document.getElementById("interviewAddress").value,
    remarks: document.getElementById("interviewRemarks").value
  };
}

// ===============================
// ✅ VALIDATION
// ===============================
function validateForm(data) {
  if (!data.date || !data.time || !data.mode) {
    showToast("Fill required fields", "error");
    return false;
  }

  if (data.mode === "ONLINE" && !data.meeting_link) {
    showToast("Meeting link required", "error");
    return false;
  }

  if (data.mode === "OFFLINE" && !data.address) {
    showToast("Address required", "error");
    return false;
  }

  return true;
}

// ===============================
// 🌐 API CALL
// ===============================
async function handleScheduleInterview() {
  const data = getFormData();

  if (!validateForm(data)) return;

  const btn = document.getElementById("confirmScheduleBtn");

  try {
    btn.disabled = true;
    btn.innerText = "Scheduling...";

    const res = await fetch("/company/schedule-interview/", {
      method: "POST",
      headers: {
        "X-CSRFToken": getCSRFToken(),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(data)
    });

    const result = await res.json();

    if (!result.success) throw new Error(result.error);

    showToast("Interview Scheduled ✅", "success");

    setTimeout(() => location.reload(), 1200);

  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerText = "Schedule Interview";
  }
}

// ===============================
// 💼 VIEW JOB DETAILS (FIX)
// ===============================
document.addEventListener("click", async function (e) {

  const btn = e.target.closest(".view-job-details");
  if (!btn) return;

  const jobId = btn.dataset.id;

  const modalEl = document.getElementById("jobDetailsModal");
  if (!modalEl) return;

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  try {
    const res = await fetch(`/jobs/job-detail/${jobId}/`);
    const result = await res.json();

    if (!result.success) throw new Error();

    const data = result.data;

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

    const pdfBtn = document.getElementById("jobDetailsPdf");
    if (pdfBtn) {
      if (data.pdf) {
        pdfBtn.href = data.pdf;
        pdfBtn.classList.remove("d-none");
      } else {
        pdfBtn.classList.add("d-none");
      }
    }

  } catch (err) {
    console.error(err);
    showToast("Failed to load job details", "error");
  }
});


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
    const res = await fetch(`/company/interview-details/${appId}/`);

        // ⚠️ Check HTTP response status
        if (!res.ok) {
            throw new Error("Server error");
        }

        // 📦 Parse JSON response
        const data = await res.json();

        const item = data[0];
        
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

// ======================================================
// 🎯 ACTION CONFIG (SINGLE SOURCE OF TRUTH)
// ======================================================
const ACTIONS = {
    select: {
        triggerClass: "action-select",
        modalId: "selectStudentModal",
        nameField: "confirmSelectStudentName",
        confirmBtn: "confirmSelectBtn",
        status: "SELECTED",
        remarksField: "selectRemarks"
    },
    reject: {
        triggerClass: "action-reject",
        modalId: "rejectStudentModal",
        nameField: "confirmRejectStudentName",
        confirmBtn: "confirmRejectBtn",
        status: "INTERVIEW_REJECTED",
        remarksField: "rejectRemarks"
    },
    hold: {
        triggerClass: "action-hold",
        modalId: "holdStudentModal",
        nameField: "confirmHoldStudentName",
        confirmBtn: "confirmHoldBtn",
        status: "INTERVIEW_HOLD",
        remarksField: "holdRemarks"
    }
};

// ======================================================
// 🧠 MAIN EVENT HANDLER (ONE LISTENER ONLY)
// ======================================================
document.addEventListener("click", async function (e) {

    // ============================
    // 🔹 OPEN MODAL
    // ============================
    for (const key in ACTIONS) {
        const action = ACTIONS[key];
        const btn = e.target.closest(`.${action.triggerClass}`);

        if (btn) {
            openModal(btn, action);
            return;
        }
    }

    // ============================
    // 🔹 CONFIRM ACTION
    // ============================
    for (const key in ACTIONS) {
        const action = ACTIONS[key];
        const confirmBtn = e.target.closest(`#${action.confirmBtn}`);

        if (confirmBtn) {
            await handleStatusUpdate(action);
            return;
        }
    }
});

// ======================================================
// 🎯 OPEN MODAL
// ======================================================
function openModal(button, action) {
    currentAppId = button.dataset.id;

    const studentName = button.dataset.studentName || "Student";

    // Set name
    const nameField = document.getElementById(action.nameField);
    if (nameField) nameField.innerText = studentName;

    // Clear previous remarks (UX 🔥)
    const remarksField = document.getElementById(action.remarksField);
    if (remarksField) remarksField.value = "";

    // Show modal
    const modalEl = document.getElementById(action.modalId);
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

// ======================================================
// 🎯 HANDLE STATUS UPDATE
// ======================================================
async function handleStatusUpdate(action) {

    if (!currentAppId) {
        showToast("Application ID missing", "error");
        return;
    }

    const remarksInput = document.getElementById(action.remarksField);
    const remarks = remarksInput?.value.trim() || "";

    // // 🔒 Validation
    // if (!remarks) {
    //     showToast("Please enter remarks", "error");
    //     return;
    // }

    try {
        toggleLoading(true);

        const response = await fetch("/company/update-status/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken(),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                app_id: currentAppId,
                status: action.status,
                remarks: remarks
            })
        });

        if (!response.ok) {
            throw new Error(`Server error (${response.status})`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Update failed");
        }

        // ✅ SUCCESS
        showToast("Status updated successfully ✅", "success");

        // Close modal 🔥
        closeAllModals();

        // Update UI
        handleUIUpdate(action.status);

    } catch (error) {
        console.error("Update Status Error:", error);
        showToast(error.message || "Something went wrong", "error");
    } finally {
        toggleLoading(false);
    }
}

// ======================================================
// 🔄 LOADING STATE
// ======================================================
function toggleLoading(isLoading) {
    Object.values(ACTIONS).forEach(action => {
        const btn = document.getElementById(action.confirmBtn);
        if (!btn) return;

        // Save original HTML (important 🔥)
        if (!btn.dataset.originalText) {
            btn.dataset.originalText = btn.innerHTML;
        }

        btn.disabled = isLoading;

        if (isLoading) {
            btn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-1"></span>
                Processing...
            `;
        } else {
            btn.innerHTML = btn.dataset.originalText;
        }
    });
}

// ======================================================
// ❌ CLOSE ALL MODALS
// ======================================================
function closeAllModals() {
    document.querySelectorAll(".modal.show").forEach(modalEl => {
        bootstrap.Modal.getInstance(modalEl)?.hide();
    });
}

// ======================================================
// 🎯 UI UPDATE (OPTIONAL)
// ======================================================
function handleUIUpdate(status) {

    const row = document.querySelector(`[data-row-id="${currentAppId}"]`);

    if (row) {
        const badge = row.querySelector(".status-badge");

        if (badge) {
            badge.innerText = status.replace("_", " ");
            badge.className = `badge status-badge ${getStatusClass(status)}`;
        }
    }

    setTimeout(() => location.reload(), 1200);
}

// ======================================================
// 🎨 STATUS COLOR HELPER
// ======================================================
function getStatusClass(status) {
    switch (status) {
        case "SELECTED": return "badge-success";
        case "INTERVIEW_HOLD": return "badge-warning";
        case "INTERVIEW_REJECTED": return "badge-danger";
        default: return "badge-secondary";
    }
}

setTimeout(() => {
  document.querySelectorAll('.toast').forEach(toast => {
    toast.style.display = 'none';
  });
}, 3000);