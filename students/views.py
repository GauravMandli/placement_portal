from django.shortcuts import render,redirect  #html page show and url par moklva mate
from django.contrib import messages #sucess /errer message 
from django.db import transaction #db safe option
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.http import HttpResponseForbidden
from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Q, Subquery #Complex query banava mate (AND, OR, NOT),Ek query ni andar biji query (nested query)

from accounts.models import User #custom user model
from .models import StudentProfile #extra student model for 
from jobs.models import JobRequirement
from .forms import StudentRegisterForm
from django.shortcuts import get_object_or_404
from accounts.decorators import student_required

from django.http import JsonResponse
from .models import JobApplication
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import IntegrityError, transaction #Duplicate / constraint error handle
from django.views.decorators.http import require_POST #Only POST request allow
from django.core.paginator import Paginator #data ne pages ma divide

from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET
from companies.models import Interview


from django.views.decorators.http import require_http_methods
from django.core.exceptions import PermissionDenied
import logging

from placement_portal.views import contact_view

# Create your views here.

#========================
# helper function
#========================
def get_user_student(request):
    return get_object_or_404(StudentProfile, user=request.user)


#===================
#register view
#===================
def student_register(request):
   # print("view hit")
    if request.method == "POST":

        #===============================
        # GET FORM DATA
        # ===============================
        form = StudentRegisterForm(request.POST, request.FILES)

        if form.is_valid():

            try:
                #  DATABASE TRANSACTION
                with transaction.atomic():
                    
                    enroll_number = form.cleaned_data.get("enroll_number")
                    email = form.cleaned_data.get("email")
                    password = form.cleaned_data.get("password")

                    #create user
                    user = User.objects.create_user(
                        username=enroll_number,
                        email=email,
                        password=password,
                        first_name=form.cleaned_data.get("first_name"),
                        last_name=form.cleaned_data.get("last_name"),
                        role="student"
                    )

                    #create student profile
                    student = form.save(commit=False)
                    student.user = user #user link karvu
                    student.save()#student profile db save thase
            
                messages.success(request, "Registration successful! Please login.")
                return redirect("student_login")
            
            except Exception as e:
                print("REGISTER ERROR:", e)
                messages.error(request,"Something went wrong. Please try again.")
                return redirect("student_register")
            
    else:
        form = StudentRegisterForm()
    
    context={"form": form
             }
        
    return render(request, "student/pages/student_register.html",context)




#=======================
#dasbord view 
#=====================
@login_required(login_url="student_login")
@never_cache
@student_required
def student_dashboard(request):

    #role check 
    # if request.user.role != "student":
    #     return HttpResponseForbidden("Unauthorized")

    # Safe profile fetch or create
    profile = get_user_student(request)

    #greeting logic 
    current_hour = timezone.localtime().hour

    if current_hour <12 :
        greeting = "Good Morning"
    elif 12 <= current_hour < 17:
        greeting = "Good Afternoon"
    else:
        greeting = "Good Evening"

    # Send data to template
    context = {
        "greeting" : greeting,
        "profile": profile,
        "user": request.user,
        "active_page": "dashboard",
        "page_title": "Dashboard"

    }

    return render(request, "student/pages/student_dashboard.html", context)

#=============================
#update personal detil  page
#==============================
@login_required(login_url="student_login")
@never_cache
@student_required
def update_details(request):

    #role check 
    # if request.user.role != "student":
    #     return HttpResponseForbidden("Unauthorized")
    
    # Safe profile fetch 
    profile = get_user_student(request)
    
    if request.method == "POST":
        print("POST DATA:", request.POST)  
        # =========================
        # PASSWORD UPDATE SECTION
        # =========================
        new_password = request.POST.get("new_password")
        confirm_password = request.POST.get("confirm_password")
        current_password = request.POST.get("current_password")

        if new_password or confirm_password:
            
            #current password check 
            if not request.user.check_password(current_password):
                messages.error(request,"Current password is incorrect.")
                return redirect("update_details")
            
            #Match check 
            if new_password != confirm_password:
                messages.error(request,"Passwords do not match.")
                return redirect("update_details")

            #length check
            if len(new_password) < 6:
                messages.error(request,"Password must be at least 6 characters.")
                return redirect("update_details")
            
            #set new password
            request.user.set_password(new_password)
            request.user.save()

            #keep session actve
            update_session_auth_hash(request,request.user)

            messages.success(request,"Password update successfully!")

            if request.POST.get("redirect_dashboard"):
                return redirect("student_dashboard")
            else:
                return redirect("update_details")

        # =========================
        # PROFILE UPDATE SECTION
        # =========================

        #update user model
        request.user.first_name =request.POST.get("first_name", "")
        request.user.last_name = request.POST.get("last_name", "")
        request.user.email = request.POST.get("email", "")
        request.user.save()

        #upadate profile model
        profile.phone = request.POST.get("phone", "")
        profile.dob = request.POST.get("dob") or None
        profile.gender = request.POST.get("gender", "")
        profile.course = request.POST.get("course", "")
        profile.year = request.POST.get("year", "")
        profile.cgpa = request.POST.get("cgpa") or None
        profile.skills = request.POST.get("skills", "")
        profile.linkedin = request.POST.get("linkedin", "")
        profile.github = request.POST.get("github", "")
        profile.portfolio = request.POST.get("portfolio", "")

        #file uploade
        if "passport_photo" in request.FILES:
            profile.passport_photo = request.FILES["passport_photo"]

        if "resume" in request.FILES:
            profile.resume = request.FILES["resume"]

        
        
        # save
        try:
            profile.full_clean()   # model validation trigger kare
            profile.save()
            messages.success(request, "Profile updated successfully!")
        
            if request.POST.get("redirect_dashboard"):
                return redirect("student_dashboard")
            else:
                return redirect("update_details")
        

        except ValidationError as e:
            for field, errors in e.message_dict.items():
                for error in errors:
                    messages.error(request, error)

        except Exception:
            messages.error(request, "Something went wrong. Please try again.")
            return redirect("update_details")

    

    # Send data to template
    context ={
        "profile": profile,
        "active_page": "update",
        "page_title": "Update Personal Details"

    }
    return render(request,"student/pages/update_details.html",context)

#======================
#new job listing page
#=======================
@login_required(login_url="student_login")
@never_cache
@student_required
def job_listing(request):
    
    """
    Display all open job listings for students.
    """

    # Safe profile fetch 
    profile = get_user_student(request)
    today = timezone.now().date()
    
    
     # 🔥 Subquery for applied jobs (more efficient)
    applied_jobs_subquery = JobApplication.objects.filter(
        student=profile
    ).values("job_id")

    # 🔥 Base Query
    jobs = JobRequirement.objects.select_related("company").filter(
        last_date__gte=today
    ).exclude(
        status=JobRequirement.JobStatus.DRAFT
    ).exclude(
        id__in=Subquery(applied_jobs_subquery)
    )

    # 🔥 Filter (single query instead of union)
    jobs = jobs.filter(
        Q(start_date__gt=today) |   # upcoming
        Q(
            start_date__lte=today,
            status=JobRequirement.JobStatus.OPEN
        )
    ).order_by("-created_at")

    #jobs = (upcoming_jobs | current_jobs).order_by("-created_at")
    
    context = {
        "profile": profile,
        "jobs": jobs,
        "total_jobs": jobs.count(),
        "active_page": "jobs",
        "page_title": "New Job Listings",
    }

    return render(
        request,
        "student/pages/job_listing.html",
        context
    )
#======================
#applied job pages
#======================
@login_required(login_url="student_login")
@never_cache
@student_required
def applied_jobs(request):
           
    # Safe profile fetch or create
    """
    Display jobs applied by the student.
    """

    profile = get_user_student(request)

    applications_qs = JobApplication.objects.select_related(
        "job", "job__company"
    ).filter(
        student=profile
    ).order_by("-applied_at")

    # 📄 Pagination (10 per page)
    paginator = Paginator(applications_qs, 10)
    page_number = request.GET.get("page")
    applications = paginator.get_page(page_number)


    # Send data to template
    context ={
        "applications": applications,
        "profile": profile,
        "active_page": "applied",
        "page_title": "Applied Jobs"
    }
    return render(request, "student/pages/applied_jobs.html",context)

#======================
# applay jobs 
#=======================
@login_required(login_url="student_login")
@student_required
@require_POST
def apply_job(request, job_id):
    """
    Apply to a job (AJAX).
    """

    student = get_user_student(request)

    job = get_object_or_404(
        JobRequirement,
        id=job_id,
        status=JobRequirement.JobStatus.OPEN
    )

    today = timezone.now().date()

    # 🔒 Validation
    if job.start_date and job.start_date > today:
        return JsonResponse({
            "success": False,
            "message": "Job has not started yet."
        }, status=400)

    if job.last_date and job.last_date < today:
        return JsonResponse({
            "success": False,
            "message": "Job application deadline has passed."
        }, status=400)

    # ✅ Create safely (prevent duplicate)
    try:
        with transaction.atomic():
            JobApplication.objects.create(
                student=student,
                job=job
            )

    except IntegrityError:
        return JsonResponse({
            "success": False,
            "message": "You have already applied for this job."
        }, status=400)

    return JsonResponse({
        "success": True,
        "message": "Application submitted successfully."
    }, status=201)

#=========================
#shortlisted company page 
#=========================
@login_required(login_url="student_login")
@never_cache
@student_required
def shortlisted_company(request):
            
    # Safe profile fetch 
    profile = get_user_student(request)

    """
    Display shortlisted (under review) companies for the student.
    """

    shortlisted_apps = JobApplication.objects.select_related(
        "job", "job__company"
    ).filter(
        student=profile,
        status=JobApplication.Status.SHORTLISTED
    ).order_by("-applied_at")

    context = {
        "profile": profile,
        "applications": shortlisted_apps,
        "active_page": "shortlisted",
        "page_title": "Shortlisted Companies"
    }

    return render(
        request,
        "student/pages/shortlisted_company.html",
        context
    )

#=============================
#interview schedule 
#=============================
@login_required(login_url="student_login")
@never_cache
@student_required
def interview_schedule(request):
    """
    Display all scheduled interviews for the logged-in student.
    """

    profile = get_user_student(request)

    interviews = Interview.objects.select_related(
        "application",
        "application__job",
        "application__job__company"
    ).filter(
        application__student=profile
    ).order_by("date", "time")  # upcoming first

    context = {
        "interviews": interviews,
        "profile": profile,
        "active_page": "interviews",
        "page_title": "Interview Schedule"
    }

    return render(
        request,
        "student/pages/interview_schedule.html",
        context
    )

#==============================
#interview details view
#===========================
@login_required(login_url="student_login")
@student_required
@require_GET
def student_interview_details_ajax(request, app_id):
    """
    Return interview details for a student's application.
    """

    profile = get_user_student(request)

    interview = Interview.objects.select_related(
        "application__student__user"
    ).filter(
        application_id=app_id,
        application__student=profile
    ).first()   # 🔥 safe alternative to get()

    if not interview:
        return JsonResponse({
            "success": False,
            "message": "No interview found."
        }, status=404)

    data = [{
        "student_name": interview.application.student.user.get_full_name(),
        "date": interview.date.strftime("%Y-%m-%d") if interview.date else None,
        "time": interview.time.strftime("%H:%M") if interview.time else None,
        "mode": interview.mode,
        "meeting_link": interview.meeting_link,
        "address": interview.address,
        "remarks": interview.remarks,
    }]

    return JsonResponse({
        "success": True,
        "data": data
    }, status=200)


#============================
#selected company page
#=============================
@login_required(login_url="student_login")
@never_cache
@student_required
def selected_company(request):
    
    # Safe profile fetch 
    profile = get_user_student(request)
    
    # Send data to template
    context ={
                "profile": profile,
                "active_page": "selected",
                "page_title": "Selected Companies",
    }
    return render(request,"student/pages/selected_company.html",context)


#========================
#past jobs
#=========================
@login_required(login_url="student_login")
@never_cache
@student_required
def old_jobs(request):
    
    #fetch
    profile = get_user_student(request) 
    
    today = timezone.now().date()

    # 🔹 Fetch expired jobs (exclude draft)
    expired_jobs = JobRequirement.objects.select_related("company").filter(
        last_date__lt=today
    ).exclude(
        status=JobRequirement.JobStatus.DRAFT
    ).order_by("-last_date")

    context = {
        "profile": profile,
        "expired_jobs": expired_jobs,
        "total_jobs": expired_jobs.count(),
        "active_page": "past_jobs",
        "page_title": "Past Jobs / Old Companies"
    }
    return render(request,"student/pages/old_jobs.html",context)


#=========================
#placement contact pages
#==========================


logger = logging.getLogger(__name__)

@login_required(login_url="student_login")
@never_cache
@require_http_methods(["GET", "POST"])
@student_required
def placement_contact(request):

    """
    Student Contact View Wrapper

    - Ensures only authenticated students can access
    - Prevents caching
    - Allows only GET & POST methods
    - Reuses shared contact_view logic
    """
    

    try:
        # 🔐 Extra safety (defensive programming)
        if request.user.role != "student":
            raise PermissionDenied("You are not authorized to access this page.")

        # 📝 Optional logging
        logger.info(f"Student {request.user.id} accessed contact page")

        # ♻ Reuse shared contact logic
        return contact_view(request)

    except PermissionDenied:
        raise

    except Exception as e:
        logger.error(f"Error in placement_contact: {str(e)}")

        from django.http import HttpResponseServerError
        return HttpResponseServerError("Something went wrong. Please try again later.")



# #dasbord view 
# @login_required(login_url="student_login")
# @never_cache
# def student_dashboard(request):

#     # role securety check
#     student = request.user.studentprofile
#     return render(request, "student/student_dashboard.html",{
#         "student": student
#     })

