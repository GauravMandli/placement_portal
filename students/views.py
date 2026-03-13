from django.shortcuts import render,redirect  #html page show and url par moklva mate
from django.contrib import messages #sucess /errer message 
from django.db import transaction #db safe option
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.http import HttpResponseForbidden
from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ValidationError
from django.utils import timezone

from accounts.models import User #custom user model
from .models import StudentProfile #extra student model for 
from .forms import StudentRegisterForm

# Create your views here.

#register view

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





#dasbord view 
@login_required(login_url="student_login")
@never_cache
def student_dashboard(request):

    # Role security check
    if request.user.role != "student":
        return HttpResponseForbidden("Unauthorized")

    # Safe profile fetch or create
    profile = StudentProfile.objects.get(
        user=request.user
    )

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


#update personal detil  page
@login_required(login_url="student_login")
@never_cache
def update_details(request):

    #role check 
    # if request.user.role != "student":
    #     return HttpResponseForbidden("Unauthorized")
    
    # Safe profile fetch or create
    profile, created = StudentProfile.objects.get_or_create(
        user=request.user
    )

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

        from django.core.exceptions import ValidationError
        
        # save
        try:
            profile.full_clean()   # model validation trigger kare
            profile.save()
            messages.success(request, "Profile updated successfully!")

        except ValidationError as e:
            for field, errors in e.message_dict.items():
                for error in errors:
                    messages.error(request, error)

            return redirect("update_details")

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


#new job listing page
@login_required(login_url="student_login")
@never_cache
def job_listing(request):
            # Safe profile fetch or create
    profile, created = StudentProfile.objects.get_or_create(
        user=request.user
    )

        # Send data to template
    context ={
        "profile": profile,
        "active_page": "jobs",
        "page_title": "New Job Listings"
    }
    return render(request,"student/pages/job_listing.html",context)

#applied job pages
@login_required(login_url="student_login")
@never_cache
def applied_jobs(request):
            # Safe profile fetch or create
    profile, created = StudentProfile.objects.get_or_create(
        user=request.user
       

    )

        # Send data to template
    context ={
        "profile": profile,
        "active_page": "applied",
        "page_title": "Applied Jobs"
    }
    return render(request, "student/pages/applied_jobs.html",context)

#shortlisted company page 
@login_required(login_url="student_login")
@never_cache
def shortlisted_company(request):
            # Safe profile fetch or create
    profile, created = StudentProfile.objects.get_or_create(
        user=request.user
    )

        # Send data to template
    context ={
            "profile": profile,
            "active_page": "shortlisted",
            "page_title": "Shortlisted Companies"
    }
    return render(request,"student/pages/shortlisted_company.html",context)

#selected company page
@login_required(login_url="student_login")
@never_cache
def selected_company(request):
            # Safe profile fetch or create
    profile, created = StudentProfile.objects.get_or_create(
        user=request.user
    )

        # Send data to template
    context ={
                "profile": profile,
                "active_page": "selected",
                "page_title": "Selected Companies",
    }
    return render(request,"student/pages/selected_company.html",context)

#placement contact pages
@login_required(login_url="student_login")
@never_cache
def placement_contact(request):
            # Safe profile fetch or create
    profile, created = StudentProfile.objects.get_or_create(
        user=request.user
    )

        # Send data to template
    context ={
                "profile": profile,
                "active_page": "contact",
                "page_title": "Placement Cell Contact",
    }
    return render(request,"student/pages/placement_contact.html",context)





# #dasbord view 
# @login_required(login_url="student_login")
# @never_cache
# def student_dashboard(request):

#     # role securety check
#     student = request.user.studentprofile
#     return render(request, "student/student_dashboard.html",{
#         "student": student
#     })

