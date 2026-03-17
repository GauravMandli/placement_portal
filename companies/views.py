from django.shortcuts import render,redirect,get_object_or_404 #html page show and url pass
from django.contrib import messages #sucess error mesage show  for
from django.contrib.auth import get_user_model,login,logout
from django.db import transaction
from .models import CompanyProfile
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from accounts.decorators import company_required
from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ValidationError



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
    if company.status != CompanyProfile.Status.APPROVED:
        messages.warning(request, "Your account is not approved yet.")
        logout(request)
        return redirect("company_login")


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
@never_cache
def add_requirements(request):

    company = get_company(request)

    context = {
        "company": company,
        "page_title": "Add New Requirement",
        "active_page": "add_req"
    }
    return render(request,"company/pages/add_requirements.html",context)

#========================
# current_requirement
#========================
@login_required(login_url="company_login")
@never_cache
def current_requirements(request):

    company = get_company(request)

    context = {
        "company": company,
        "page_title": "Current Requirements",
        "active_page": "current_req"
    }
    return render(request,"company/pages/current_requirements.html",context)

#========================
#shortlisted_student
#========================
@login_required(login_url="company_login")
@never_cache
def shortlisted_students(request):

    company = get_company(request)

    context = {
        "company": company,
        "page_title": "Shortlisted Students",
        "active_page": "shortlisted"
    }
    return render(request,"company/pages/shortlisted_students.html",context)

#========================
#selected student 
#========================
@login_required(login_url="company_login")
@never_cache
def selected_students(request):

    company = get_company(request)

    context = {
        "company": company,
        "page_title": "Selected Students",
        "active_page": "selected"
    }
    return render(request,"company/pages/selected_students.html",context)

#========================
#old requirement 
#========================
@login_required(login_url="company_login")
@never_cache
def old_requirements(request):

    company = get_company(request)

    context = {
        "company": company,
        "page_title": "Old Requirements",
        "active_page": "old_req"
    }
    return render(request,"company/pages/old_requirements.html",context)

#========================
#old requirement 
#========================
@login_required(login_url="company_login")
@never_cache
def pc_contact(request):

    company = get_company(request)

    context = {
        "company": company,
        "page_title": "Placement Cell Contact",
        "active_page": "pc_contact"
    }
    return render(request,"company/pages/pc_contact.html",context)


