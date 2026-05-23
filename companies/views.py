from django.shortcuts import render,redirect,get_object_or_404 #html page show , url pass, db mathi object pas kare 
from django.contrib import messages #sucess error mesage show  for
from django.contrib.auth import get_user_model,login,logout
from django.contrib.auth.decorators import login_required 
from django.views.decorators.cache import never_cache
from django.db import transaction
from .models import CompanyProfile
from students.models import StudentProfile
from accounts.decorators import company_required
from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ValidationError
from students.models import JobApplication
from jobs.models import JobRequirement
from django.core.paginator import Paginator #Data ne pages ma divide kare

from django.http import JsonResponse #JSON response mokalva mate
from django.views.decorators.http import require_POST
from django.utils.dateparse import parse_date, parse_time
from .models import Interview
from .models import ShortlistedStudent, SelectionResult

from django.views.decorators.http import require_GET



from django.views.decorators.http import require_http_methods
from django.core.exceptions import PermissionDenied
import logging

from placement_portal.views import contact_view


# Create your views here.
User = get_user_model()

#========================
# helper function
#========================

def get_company(request):
    return get_object_or_404(CompanyProfile, user=request.user)
#==========================


# ===============================
# COMPANY REGISTRATION
# ===============================
def company_register(request):
    if request.method == "POST":

        company_email = request.POST.get("company_email")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")

        # Password match check
        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return render(request, "company/pages/company_register.html", {
            "old_data": request.POST
        })

        # Password length check
        if len(password) < 6:
            messages.error(request, "Password must be at least 6 characters.")
            return render(request, "company/pages/company_register.html", {
                "old_data": request.POST
            })
    
        # Duplicate email check
        if User.objects.filter(username=company_email).exists():
            messages.error(request, "Email already registered.")
            return render(request, "company/pages/company_register.html", {
                "old_data": request.POST
            })

        try:
            with transaction.atomic():

                # Create User
                user = User.objects.create_user(
                    username=company_email,
                    email=company_email,
                    password=password,
                    role="company"   # Only if role field exists
                )

                # Create Company Profile
                CompanyProfile.objects.create(
                    user=user,
                    company_name=request.POST.get("company_name"),
                    company_email=request.POST.get("company_email"),
                    phone=request.POST.get("phone"),
                    gst_number=request.POST.get("gst_number"),  #  NEW
                    industry=request.POST.get("industry"),
                    company_size=request.POST.get("company_size"),
                    website=request.POST.get("website"),
                    address=request.POST.get("address"),
                    description=request.POST.get("description"),  # NEW
                    cp_name=request.POST.get("cp_name"),
                    cp_email=request.POST.get("cp_email"),
                    cp_phone=request.POST.get("cp_phone"),
                    designation=request.POST.get("designation"),
                    reg_certificate=request.FILES.get("reg_certificate"),
                )

            messages.success(
                request,
                "Registration submitted successfully. Please wait for admin approval."
            )
            return redirect("company_login")

        except Exception as e:
            # messages.error(request, "Something went wrong. Please try again.")
            print("ERROR:", e)
            messages.error(request, "Something went wrong. Please try again.")
            return redirect("company_register")

    return render(request, "company/pages/company_register.html")


#========================
# dashboard view
#========================
@login_required(login_url="company_login")
@company_required
@never_cache
def company_dashboard(request):
    
    # Get company profile safely
    company = get_company(request)

    # 🔹 Approval check
    # ❌ PENDING
    if company.status == CompanyProfile.Status.PENDING:
        messages.warning(request, "Your account is under review.")
        logout(request)
        return redirect("company_login")

    # ❌ REJECTED
    if company.status == CompanyProfile.Status.REJECTED:
        messages.error(request, "Your account has been rejected.")
        logout(request)
        return redirect("company_login")

    # ⚠️ HOLD → allow login
    if company.status == CompanyProfile.Status.HOLD:
        messages.warning(request, "⚠️ Your job posting is currently on hold.")

    context = {
        "company": company,
        "user": request.user,
        "page_title": "Dashboard",
        "active_page": "dashboard"
    }

    return render(request, "company/pages/company_dashboard.html", context)


#========================
#update detils   
#========================
@login_required(login_url="company_login")
@company_required
@never_cache
def cmp_update_details(request):
    
    company = get_company(request) #calll compny profile 

    if request.method == "POST":

        #=============================
        # PASSWORD UPDATE section
        #=============================
        new_password = request.POST.get("new_password")
        confirm_password = request.POST.get("confirm_password")
        current_password = request.POST.get("current_password")

        if new_password or confirm_password:

            # current password check
            if not request.user.check_password(current_password):
                messages.error(request, "Current password is incorrect.")
                return redirect("companies:cmp_update_details")

            # password match
            if new_password != confirm_password:
                messages.error(request, "Passwords do not match.")
                return redirect("companies:cmp_update_details")

            # length check
            if len(new_password) < 6:
                messages.error(request, "Password must be at least 6 characters.")
                return redirect("companies:cmp_update_details")

            # set new password
            request.user.set_password(new_password)
            request.user.save()

            # keep session active
            update_session_auth_hash(request, request.user)

            messages.success(request, "Password updated successfully!")

            if request.POST.get("redirect_dashboard"):
                return redirect("companies:company_dashboard")
            else:
                return redirect("companies:cmp_update_details")

        
        # =========================
        # COMPANY BASIC DETAILS
        # =========================
        company.company_name = request.POST.get("company_name", "")
        company.company_email = request.POST.get("company_email", "")
        company.phone = request.POST.get("phone", "")
        company.gst_number = request.POST.get("gst_number", "")
        company.industry = request.POST.get("industry", "")
        company.company_size = request.POST.get("company_size", "")
        company.website = request.POST.get("website", "")

        company.description = request.POST.get("description", "")
        company.address = request.POST.get("address", "")

        # =========================
        # CONTACT PERSON DETAILS
        # =========================
        company.cp_name = request.POST.get("cp_name", "")
        company.cp_email = request.POST.get("cp_email", "")
        company.cp_phone = request.POST.get("cp_phone", "")
        company.designation = request.POST.get("designation", "")

        # =========================
        # FILE UPLOAD
        # =========================
        if "reg_certificate" in request.FILES:
            company.reg_certificate = request.FILES["reg_certificate"]

        # =========================
        # SAVE
        # =========================
        try:
            company.full_clean()
            company.save()
            messages.success(request, "Company details updated successfully!")
        
            if request.POST.get("redirect_cmp_dashboard"):
                    return redirect("companies:company_dashboard")
            else:
                    return redirect("companies:cmp_update_details")
        
        except ValidationError as e:
            for field, errors in e.message_dict.items():
                for error in errors:
                    messages.error(request, error)
            
        except Exception:
            messages.error(request, "Something went wrong. Please try again.")
            return redirect("companies:cmp_update_details")

    context = {
        "company": company,
        "page_title": "Update Company Profile",
        "active_page": "cmp_update_details"
    }
    return render(request,"company/pages/cmp_update_details.html",context)


#========================
#add requerment   
#========================
@login_required(login_url="company_login")
@company_required
@never_cache
def add_requirements(request):

    company = get_company(request)

    #  PENDING
    if company.status == CompanyProfile.Status.PENDING:
        messages.warning(request, "Your account is under review.")
        logout(request)
        return redirect("company_login")

    #  REJECTED
    if company.status == CompanyProfile.Status.REJECTED:
        messages.error(request, "Your account has been rejected.")
        logout(request)
        return redirect("company_login")

    #  HOLD → allow login
    if company.status == CompanyProfile.Status.HOLD:
        messages.warning(request, "⚠️ Your job posting is currently on hold.")

    context = {
        "company": company,
        "page_title": "Add New Requirement",
        "active_page": "add_req"
    }

    return render(request, "company/pages/add_requirements.html", context)


#========================
# current_requirement
#========================
@login_required(login_url="company_login")
@company_required
@never_cache
def current_requirements(request):

    company = get_company(request)
    
    # 🔹 Fetch only OPEN jobs of logged-in company
    jobs = JobRequirement.objects.filter(
        company=company
    ).order_by("-created_at")

    # filter in python
    jobs = [job for job in jobs if not is_job_fully_processed(job)]

    context = {
        "company": company,
        "jobs": jobs,
        "page_title": "Current Requirements",
        "active_page": "current_req"
    }
    return render(request,"company/pages/current_requirements.html",context)



#=======================
#applied student view 
#============================
@login_required(login_url="company_login")
@company_required
@never_cache
def applied_students(request, job_id):

    company = get_company(request)

    # 🔐 Secure job fetch
    job = get_object_or_404(
        JobRequirement,
        id=job_id,
        company=company
    )

    # 🔹 Base queryset
    applications = JobApplication.objects.filter(
        job=job
    ).select_related(
        "student", "student__user"
    ).order_by("-applied_at")

    # 🔹 Pagination
    paginator = Paginator(applications, 10)  # 10 per page
    page = request.GET.get("page")
    applications = paginator.get_page(page)

    context = {
        "company": company,
        "job": job,
        "applications": applications,
        "total_applications": paginator.count,
        "page_title": "Applied Students",
        "active_page": "applied_students"
    }

    return render(
        request,
        "company/pages/applied_students.html",
        context
    )


#=============================
#applied students details ajax view
#==============================
@login_required
def student_details_ajax(request, pk):

    # 🔹 Fetch student safely
    student = get_object_or_404(
        StudentProfile.objects.select_related("user"),
        pk=pk
    )

    # 🔒 Optional: restrict only company access
    if request.user.role != "company":
        return JsonResponse({
            "success": False,
            "error": "Unauthorized access"
        }, status=403)

    data = {                
        "name": student.user.get_full_name(),
        "email": student.user.email,
        "phone": student.phone,
        "cgpa": student.cgpa,
        "branch": student.course,
        "year": student.year,
        "skills": student.skills,
        "gender": student.gender,
        "dob": student.dob.strftime("%Y-%m-%d") if student.dob else "",
        "enroll": student.enroll_number,

        "resume": student.resume.url if student.resume else "",
        "photo": student.passport_photo.url if student.passport_photo else "",

        "linkedin": student.linkedin,
        "github": student.github,
        "portfolio": student.portfolio,
    }

    return JsonResponse({
        "success": True,
        "data": data
    })


#========================
#shortlisted_student
#========================
@login_required(login_url="company_login")
@company_required
@never_cache
def shortlisted_students(request):

    company = get_company(request)

    # 🔹 Fetch shortlisted applications
    applications_qs = JobApplication.objects.filter(
        job__company=company,
        status=JobApplication.Status.SHORTLISTED
    ).select_related(
        "student", "student__user"
    ).order_by("-applied_at")

    # 🔹 Pagination
    paginator = Paginator(applications_qs, 10)
    page = request.GET.get("page")
    applications = paginator.get_page(page)

    context = {
        "company": company,
        "applications": applications,
        "total_shortlisted": paginator.count,
        "page_title": "Shortlisted Students",
        "active_page": "shortlisted"
    }

    return render(
        request,
        "company/pages/shortlisted_students.html",
        context
    )
#=======================
# interview shedule
#========================
@login_required
@company_required
@require_POST
def schedule_interview(request):

    app_id = request.POST.get("app_id")

    # 🔹 Parse date & time safely
    interview_date = parse_date(request.POST.get("date"))
    interview_time = parse_time(request.POST.get("time"))

    mode = request.POST.get("mode")
    meeting_link = request.POST.get("meeting_link")
    address = request.POST.get("address")
    remarks = request.POST.get("remarks")

    # 🔹 Fetch application securely
    application = get_object_or_404(
        JobApplication.objects.select_related("job", "job__company"),
        id=app_id
    )

    # 🔐 Security check
    if application.job.company.user != request.user:
        return JsonResponse({
            "success": False,
            "error": "Unauthorized access"
        }, status=403)

    # 🔹 Validation
    if not interview_date or not interview_time:
        return JsonResponse({
            "success": False,
            "error": "Invalid date or time"
        }, status=400)

    if mode not in [Interview.Mode.ONLINE, Interview.Mode.OFFLINE]:
        return JsonResponse({
            "success": False,
            "error": "Invalid mode"
        }, status=400)

    if mode == Interview.Mode.ONLINE and not meeting_link:
        return JsonResponse({
            "success": False,
            "error": "Meeting link required for online interview"
        }, status=400)

    if mode == Interview.Mode.OFFLINE and not address:
        return JsonResponse({
            "success": False,
            "error": "Address required for offline interview"
        }, status=400)

    # 🔹 Create or update interview
    interview, created = Interview.objects.update_or_create(
        application=application,
        defaults={
            "date": interview_date,
            "time": interview_time,
            "mode": mode,
            "meeting_link": meeting_link,
            "address": address,
            "remarks": remarks,
        }
    )

    # 🔹 Update application status
    application.status = JobApplication.Status.INTERVIEW
    application.save(update_fields=["status"])

    return JsonResponse({
        "success": True,
        "message": "Interview scheduled successfully",
        "created": created
    })
#=======================
#interview Shortlisted
#=========================
@login_required(login_url="company_login")
@company_required
@never_cache
def interview_shortlisted(request):

    company = get_company(request)

    # 🔹 Base queryset
    interviews_qs = Interview.objects.filter(
        application__job__company=company,
        application__status__in=[
            JobApplication.Status.INTERVIEW,
            JobApplication.Status.INTERVIEW_HOLD,
            JobApplication.Status.INTERVIEW_REJECTED
        ]
    ).order_by("date", "time")

    # 🔹 Pagination
    paginator = Paginator(interviews_qs, 10)
    page = request.GET.get("page")
    interviews = paginator.get_page(page)

    context = {
        "company": company,
        "interviews": interviews,
        "total_interviews": paginator.count,
        "page_title": "Interview Scheduled",
        "active_page": "interview"
    }

    return render(
        request,
        "company/pages/interview_shortlisted.html",
        context
    )

#========================
#selected student 
#========================
@login_required(login_url="company_login")
@company_required
@never_cache
def selected_students(request):

    company = get_company(request)

    # 🔹 Base queryset
    applications_qs = JobApplication.objects.filter(
        job__company=company,
        status=JobApplication.Status.SELECTED
    ).select_related(
        "student", "student__user", "job"
    ).order_by("-updated_at")

    # 🔹 Pagination
    paginator = Paginator(applications_qs, 10)
    page = request.GET.get("page")
    applications = paginator.get_page(page)

    context = {
        "company": company,
        "applications": applications,
        "total_selected": paginator.count,
        "page_title": "Selected Students",
        "active_page": "selected"
    }

    return render(
        request,
        "company/pages/selected_students.html",
        context
    )




def is_job_fully_processed(job):
    return not JobApplication.objects.filter(
        job=job,
        status__in=[
            JobApplication.Status.APPLIED,
            JobApplication.Status.SHORTLISTED,
            JobApplication.Status.INTERVIEW,
            JobApplication.Status.INTERVIEW_HOLD,
            JobApplication.Status.UNDER_REVIEW,
        ]
    ).exists()
#========================
#old requirement 
#========================
@login_required(login_url="company_login")
@company_required
@never_cache
def old_requirements(request):

    company = get_company(request)

    # 🔹 Base queryset
    jobs_qs = JobRequirement.objects.filter(
        company=company
    ).order_by("-created_at")

    jobs_qs = [job for job in jobs_qs if is_job_fully_processed(job)]

    # 🔹 Search (optional)
    search = request.GET.get("q")
    if search:
        jobs_qs = jobs_qs.filter(
            job_title__icontains=search
        )

    # 🔹 Pagination
    paginator = Paginator(jobs_qs, 10)
    page = request.GET.get("page")
    jobs = paginator.get_page(page)

    context = {
        "company": company,
        "jobs": jobs,
        "total_jobs": paginator.count,
        "page_title": "Old Requirements",
        "active_page": "old_req"
    }

    return render(
        request,
        "company/pages/old_requirements.html",
        context
    )
# pc contact 



logger = logging.getLogger(__name__)

@login_required(login_url="company_login")
@never_cache
@require_http_methods(["GET", "POST"])
@company_required
def pc_contact(request):
    """
    Company Contact View Wrapper

    - Only authenticated company users allowed
    - Prevents caching
    - Allows only GET & POST
    - Reuses shared contact logic
    """

    try:
        # 🔐 Extra safety check
        if request.user.role != "company":
            raise PermissionDenied("Unauthorized access.")

        # 📝 Logging (optional)
        logger.info(f"Company {request.user.id} accessed contact page")

        return contact_view(request)

    except PermissionDenied:
        raise

    except Exception as e:
        logger.error(f"Error in pc_contact: {str(e)}")

        from django.http import HttpResponseServerError
        return HttpResponseServerError("Something went wrong. Try again later.")

#=======================
#updae status 
#=======================


@login_required
@company_required
@require_POST
def update_application_status(request):

    app_id = request.POST.get("app_id")
    new_status = request.POST.get("status")
    remarks = request.POST.get("remarks", "")

    # 🔹 Basic validation
    if not app_id or not new_status:
        return JsonResponse({
            "success": False,
            "error": "Missing required data"
        }, status=400)

    # 🔹 Fetch application
    application = get_object_or_404(
        JobApplication.objects.select_related("job", "job__company"),
        id=app_id
    )

    # 🔐 Security check
    if application.job.company.user != request.user:
        return JsonResponse({
            "success": False,
            "error": "Unauthorized access"
        }, status=403)

    current_status = application.status

    # 🔥 STATE MACHINE (VALID FLOW)
    VALID_TRANSITIONS = {
        JobApplication.Status.APPLIED: [
            JobApplication.Status.SHORTLISTED,
            JobApplication.Status.REJECTED,
        ],
        JobApplication.Status.SHORTLISTED: [
            JobApplication.Status.INTERVIEW,
            JobApplication.Status.UNDER_REVIEW,
            JobApplication.Status.REJECTED,
        ],
        JobApplication.Status.INTERVIEW: [
            JobApplication.Status.SELECTED,
            JobApplication.Status.INTERVIEW_REJECTED,
            JobApplication.Status.INTERVIEW_HOLD,
        ],
        JobApplication.Status.SELECTED: [
            JobApplication.Status.INTERVIEW_HOLD,
            JobApplication.Status.INTERVIEW_REJECTED,
        ],

        JobApplication.Status.INTERVIEW_HOLD: [
            JobApplication.Status.SELECTED,
            JobApplication.Status.INTERVIEW_REJECTED,
        ],

        JobApplication.Status.INTERVIEW_REJECTED: [
            JobApplication.Status.SELECTED,
            JobApplication.Status.INTERVIEW_HOLD,
        ],
    }

    # ❌ Same status block
    if current_status == new_status:
        return JsonResponse({
            "success": False,
            "error": "Status already set"
        }, status=400)

    # ❌ Invalid transition block
    if new_status not in VALID_TRANSITIONS.get(current_status, []):
        return JsonResponse({
            "success": False,
            "error": f"Invalid transition: {current_status} → {new_status}"
        }, status=400)

    try:
        with transaction.atomic():

            # 🔹 SHORTLIST
            if new_status == JobApplication.Status.SHORTLISTED:
                ShortlistedStudent.objects.get_or_create(
                    application=application
                )

            # 🔹 FINAL RESULT (SELECT / REJECT)
            
            # 🔹 SELECT
            if new_status == JobApplication.Status.SELECTED:
                SelectionResult.objects.update_or_create(
                    application=application,
                    defaults={
                        "result": JobApplication.Status.SELECTED,
                        "remarks": remarks
                    }
                )

            # 🔹 REJECT AFTER INTERVIEW
            if new_status == JobApplication.Status.INTERVIEW_REJECTED:
                SelectionResult.objects.update_or_create(
                    application=application,
                    defaults={
                        "result": SelectionResult.ResultStatus.REJECTED,
                        "remarks": remarks
                    }
                )

            # 🔹 INTERVIEW HOLD
            if new_status == JobApplication.Status.INTERVIEW_HOLD:
                interview = getattr(application, "interview", None)

                if not interview:
                    raise ValueError("Interview not scheduled")

                interview.remarks = remarks
                interview.save(update_fields=["remarks"])

            # 🔹 CLEANUP (Optional but PRO 🔥)
            if new_status == JobApplication.Status.REJECTED:
                ShortlistedStudent.objects.filter(
                    application=application
                ).delete()

            # 🔹 FINAL STATUS UPDATE
            application.status = new_status
            application.save(update_fields=["status"])

    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

    return JsonResponse({
        "success": True,
        "message": f"Application updated to {new_status}",
        "new_status": new_status
    })





@require_GET  # 🔒 Only GET request allow
def interview_details_ajax(request, app_id):

    try:
        # ⚡ Optimized query (reduce DB hits)
        interviews = Interview.objects.select_related(
            "application__student__user"
        ).filter(application_id=app_id)

        # 📭 Jo koi interview na hoy
        if not interviews.exists():
            return JsonResponse(
                {"error": "No interview found"},
                status=404
            )

        # 📦 Convert queryset → list of dict
        data = []

        for interview in interviews:
            data.append({
                "student_name": interview.application.student.user.get_full_name(),
                "date": interview.date.strftime("%Y-%m-%d") if interview.date else None,
                "time": interview.time.strftime("%H:%M") if interview.time else None,
                "mode": interview.mode,
                "meeting_link": interview.meeting_link,
                "address": interview.address,
                "remarks": interview.remarks,
            })

        # ✅ Always return list (frontend consistent rahe)
        return JsonResponse(data, safe=False)

    except Exception as e:
        # 🧨 Unexpected error handling
        return JsonResponse(
            {"error": "Something went wrong", "details": str(e)},
            status=500
        )