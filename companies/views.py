from django.shortcuts import render,redirect #html page show and url pass
from django.contrib import messages #sucess error mesage show  for
from django.contrib.auth import get_user_model,login,logout
from django.db import transaction
from .models import CompanyProfile
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache





# Create your views here.

User = get_user_model()


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

# dashboard view
@login_required(login_url="company_login")
@never_cache
def company_dashboard(request):
    
    profile = CompanyProfile.objects.get(user=request.user)

    # 🔹 Role check
    if request.user.role != "company":
        messages.error(request, "Access denied.")
        return redirect("company_login")

    try:
        profile = CompanyProfile.objects.get(user=request.user)
    except CompanyProfile.DoesNotExist:
        messages.error(request, "Company profile not found.")
        logout(request)
        return redirect("company_login")

    # 🔹 Approval check
    if profile.status != CompanyProfile.Status.APPROVED:
        messages.warning(request, "Your account is not approved yet.")
        logout(request)
        return redirect("company_login")

    context = {
        "profile": profile,
        "company": profile,
    }

    return render(request, "company/pages/company_dashboard.html", context)


