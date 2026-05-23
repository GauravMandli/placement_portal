function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
    return "";
}

function showSideMessage(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    toast.style.zIndex = "2000";
    toast.style.minWidth = "280px";
    toast.style.maxWidth = "360px";
    toast.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(function () {
        toast.remove();
    }, 2800);
}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        const alerts = document.querySelectorAll(".alert");
        alerts.forEach(function (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 4000);

    document.querySelectorAll(".password-toggle").forEach(function (toggle) {
        toggle.addEventListener("click", function () {
            const input = this.parentElement.querySelector(".password-field");
            const icon = this.querySelector("i");
            if (!input || !icon) return;

            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
        });
    });

    // Student forgot password flow
    const studentVerifyBtn = document.getElementById("verifyStudentDetailsBtn");
    const studentPasswordFields = document.getElementById("studentPasswordFields");
    const studentForm = document.getElementById("studentForgotPasswordForm");
    const studentModal = document.getElementById("studentForgotPasswordModal");

    async function postStudentForgotPassword(payload) {
        const response = await fetch("/accounts/student-forgot-password/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify(payload)
        });
        return response.json();
    }

    if (studentVerifyBtn) {
        studentVerifyBtn.addEventListener("click", async function () {
            const enrollNo = document.getElementById("forgotEnrollNo")?.value.trim();
            const dob = document.getElementById("forgotDob")?.value;

            if (!enrollNo || !dob) {
                showSideMessage("Please enter Enrollment Number and Date of Birth.", "danger");
                return;
            }

            const result = await postStudentForgotPassword({ enroll_no: enrollNo, dob: dob });
            if (!result.success) {
                showSideMessage(result.message || "Verification failed.", "danger");
                return;
            }
            showSideMessage(result.message || "Details verified.", "success");
            studentPasswordFields?.classList.remove("d-none");
        });
    }

    if (studentForm) {
        studentForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const enrollNo = document.getElementById("forgotEnrollNo")?.value.trim();
            const dob = document.getElementById("forgotDob")?.value;
            const newPassword = document.getElementById("studentNewPassword")?.value;
            const confirmPassword = document.getElementById("studentConfirmPassword")?.value;

            const result = await postStudentForgotPassword({
                enroll_no: enrollNo,
                dob: dob,
                new_password: newPassword,
                confirm_password: confirmPassword
            });

            showSideMessage(
                result.message || "Request completed.",
                result.success ? "success" : "danger"
            );
            if (result.success) {
                studentForm.reset();
                studentPasswordFields?.classList.add("d-none");
                const bsModal = bootstrap.Modal.getInstance(studentModal);
                if (bsModal) bsModal.hide();
            }
        });
    }

    if (studentModal) {
        studentModal.addEventListener("hidden.bs.modal", function () {
            studentPasswordFields?.classList.add("d-none");
            studentForm?.reset();
        });
    }

    // Company forgot password flow
    const companyVerifyBtn = document.getElementById("companyVerifyDetailsBtn");
    const companyPasswordFields = document.getElementById("companyAlternativePasswordFields");
    const companyForm = document.getElementById("companyForgotPasswordAlternativeForm");
    const companyModal = document.getElementById("companyForgotPasswordModal");

    async function postCompanyForgotPassword(payload) {
        const response = await fetch("/accounts/company-forgot-password/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify(payload)
        });
        return response.json();
    }

    if (companyVerifyBtn) {
        companyVerifyBtn.addEventListener("click", async function () {
            const companyEmail = document.getElementById("companyRecoveryEmail")?.value.trim();
            const contactEmail = document.getElementById("companyContactPersonEmail")?.value.trim();

            if (!companyEmail || !contactEmail) {
                showSideMessage("Please enter Company Email and Contact Person Email.", "danger");
                return;
            }

            const result = await postCompanyForgotPassword({
                company_email: companyEmail,
                contact_person_email: contactEmail
            });
            if (!result.success) {
                showSideMessage(result.message || "Verification failed.", "danger");
                return;
            }
            showSideMessage(result.message || "Details verified.", "success");
            companyPasswordFields?.classList.remove("d-none");
        });
    }

    if (companyForm) {
        companyForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const companyEmail = document.getElementById("companyRecoveryEmail")?.value.trim();
            const contactEmail = document.getElementById("companyContactPersonEmail")?.value.trim();
            const newPassword = document.getElementById("companyNewPasswordAlt")?.value;
            const confirmPassword = document.getElementById("companyConfirmPasswordAlt")?.value;

            const result = await postCompanyForgotPassword({
                company_email: companyEmail,
                contact_person_email: contactEmail,
                new_password: newPassword,
                confirm_password: confirmPassword
            });

            showSideMessage(
                result.message || "Request completed.",
                result.success ? "success" : "danger"
            );
            if (result.success) {
                companyForm.reset();
                companyPasswordFields?.classList.add("d-none");
                const bsModal = bootstrap.Modal.getInstance(companyModal);
                if (bsModal) bsModal.hide();
            }
        });
    }

    if (companyModal) {
        companyModal.addEventListener("hidden.bs.modal", function () {
            companyPasswordFields?.classList.add("d-none");
            companyForm?.reset();
        });
    }

    // Placement cell forgot password flow
    const pcVerifyBtn = document.getElementById("pcVerifyDetailsBtn");
    const pcPasswordFields = document.getElementById("pcAlternativePasswordFields");
    const pcForm = document.getElementById("pcForgotPasswordAlternativeForm");
    const pcModal = document.getElementById("pcForgotPasswordModal");

    async function postPcForgotPassword(payload) {
        const response = await fetch("/accounts/pc-forgot-password/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify(payload)
        });
        return response.json();
    }

    if (pcVerifyBtn) {
        pcVerifyBtn.addEventListener("click", async function () {
            const username = document.getElementById("pcRecoveryUsername")?.value.trim();
            if (!username) {
                showSideMessage("Please enter Placement Cell Username.", "danger");
                return;
            }

            const result = await postPcForgotPassword({ username: username });
            if (!result.success) {
                showSideMessage(result.message || "Verification failed.", "danger");
                return;
            }
            showSideMessage(result.message || "Username verified.", "success");
            pcPasswordFields?.classList.remove("d-none");
        });
    }

    if (pcForm) {
        pcForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = document.getElementById("pcRecoveryUsername")?.value.trim();
            const newPassword = document.getElementById("pcNewPasswordAlt")?.value;
            const confirmPassword = document.getElementById("pcConfirmPasswordAlt")?.value;

            const result = await postPcForgotPassword({
                username: username,
                new_password: newPassword,
                confirm_password: confirmPassword
            });

            showSideMessage(
                result.message || "Request completed.",
                result.success ? "success" : "danger"
            );
            if (result.success) {
                pcForm.reset();
                pcPasswordFields?.classList.add("d-none");
                const bsModal = bootstrap.Modal.getInstance(pcModal);
                if (bsModal) bsModal.hide();
            }
        });
    }

    if (pcModal) {
        pcModal.addEventListener("hidden.bs.modal", function () {
            pcPasswordFields?.classList.add("d-none");
            pcForm?.reset();
        });
    }
});
