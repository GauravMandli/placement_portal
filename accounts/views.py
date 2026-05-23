from django.shortcuts import render,redirect
from django.contrib.auth import authenticate, login,logout
from django.contrib import messages
from companies.models import CompanyProfile
from students.models import StudentProfile
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from accounts.models import User


from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from students.models import StudentProfile
import json

# Create your views here.

User = get_user_model()


# ==================================
# STUDENT LOGIN
# ==================================
def student_login(request):
    if request.method == "POST":
        enroll_number = request.POST.get("enroll_number")
        password = request.POST.get("password")


        user = authenticate(request, username=enroll_number, password=password)
        
        print("Enroll Entered:", enroll_number)
        print("Password Entered:", password)
        print("User:", user)

        if user:
            print("Role:", user.role)
        # Invalid credentials
        if user is None:
            messages.error(request, "Invalid enrollment number or password.")
            return redirect("student_login")

        # Role check
        if user.role != "student":
            messages.error(request, "Access denied. Not a student account.")
            return redirect("student_login")

        # Profile check
        try:
            StudentProfile.objects.get(user=user)
        except StudentProfile.DoesNotExist:
            messages.error(request, "Student profile not found.")
            return redirect("student_login")

        login(request, user)
        messages.success(request, "Login successful.")
        return redirect("student_dashboard")

    return render(request, "student/pages/student_login.html")

#===================================
#student forgot password 
#==================================
@require_POST
def student_forgot_password(request):
    try:
        data = json.loads(request.body or "{}")

        enroll_no = (data.get("enroll_no") or "").strip()
        dob = data.get("dob")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if not enroll_no or not dob:
            return JsonResponse({"success": False, "message": "Enrollment number and date of birth are required."}, status=400)

        try:
            dob_parsed = datetime.strptime(dob, "%Y-%m-%d").date()
        except ValueError:
            return JsonResponse({"success": False, "message": "Invalid date format."}, status=400)

        student = StudentProfile.objects.filter(
            enroll_number=enroll_no,
            dob=dob_parsed
        ).select_related("user").first()

        if not student:
            return JsonResponse({"success": False, "message": "Invalid enrollment number or date of birth."}, status=404)

        if not new_password and not confirm_password:
            return JsonResponse({"success": True, "verified": True, "message": "Details verified."})

        if not new_password or not confirm_password:
            return JsonResponse({"success": False, "message": "Both new password and confirm password are required."}, status=400)

        if new_password != confirm_password:
            return JsonResponse({"success": False, "message": "Passwords do not match."}, status=400)

        try:
            validate_password(new_password, user=student.user)
        except ValidationError as err:
            return JsonResponse({"success": False, "message": err.messages[0]}, status=400)

        student.user.set_password(new_password)
        student.user.save()

        return JsonResponse({"success": True, "message": "Password changed successfully."})

    except Exception as e:
        print("ERROR:", e)
        return JsonResponse({"success": False, "message": "Server error."}, status=500)


@require_POST
def company_forgot_password(request):
    try:
        data = json.loads(request.body or "{}")

        company_email = (data.get("company_email") or "").strip().lower()
        contact_person_email = (data.get("contact_person_email") or "").strip().lower()
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if not company_email or not contact_person_email:
            return JsonResponse({"success": False, "message": "Company email and contact person email are required."}, status=400)

        company = CompanyProfile.objects.select_related("user").filter(
            company_email__iexact=company_email,
            cp_email__iexact=contact_person_email
        ).first()

        if not company:
            return JsonResponse({"success": False, "message": "Invalid company details."}, status=404)

        if not new_password and not confirm_password:
            return JsonResponse({"success": True, "verified": True, "message": "Details verified."})

        if not new_password or not confirm_password:
            return JsonResponse({"success": False, "message": "Both new password and confirm password are required."}, status=400)

        if new_password != confirm_password:
            return JsonResponse({"success": False, "message": "Passwords do not match."}, status=400)

        try:
            validate_password(new_password, user=company.user)
        except ValidationError as err:
            return JsonResponse({"success": False, "message": err.messages[0]}, status=400)

        company.user.set_password(new_password)
        company.user.save()

        return JsonResponse({"success": True, "message": "Password changed successfully."})

    except Exception as e:
        print("ERROR:", e)
        return JsonResponse({"success": False, "message": "Server error."}, status=500)


@require_POST
def pc_forgot_password(request):
    try:
        data = json.loads(request.body or "{}")

        username = (data.get("username") or "").strip()
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if not username:
            return JsonResponse({"success": False, "message": "Placement cell username is required."}, status=400)

        user = User.objects.filter(username__iexact=username, role="placement_cell").first()
        if not user:
            return JsonResponse({"success": False, "message": "Invalid placement cell username."}, status=404)

        if not new_password and not confirm_password:
            return JsonResponse({"success": True, "verified": True, "message": "Username verified."})

        if not new_password or not confirm_password:
            return JsonResponse({"success": False, "message": "Both new password and confirm password are required."}, status=400)

        if new_password != confirm_password:
            return JsonResponse({"success": False, "message": "Passwords do not match."}, status=400)

        try:
            validate_password(new_password, user=user)
        except ValidationError as err:
            return JsonResponse({"success": False, "message": err.messages[0]}, status=400)

        user.set_password(new_password)
        user.save()

        return JsonResponse({"success": True, "message": "Password changed successfully."})

    except Exception as e:
        print("ERROR:", e)
        return JsonResponse({"success": False, "message": "Server error."}, status=500)

# ==================================
# COMPANY LOGIN
# ==================================
def company_login(request):
    if request.method == "POST":
        company_email = request.POST.get("email").lower()
        password = request.POST.get("password")

        user = authenticate(request, username=company_email, password=password)

        #  Invalid credentials
        if user is None:
            messages.error(request, "Invalid email or password.")
            return redirect("company_login")

        #  Role check
        if user.role != "company":
            messages.error(request, "Access denied.")
            return redirect("company_login")

        # 🔹 Get Profile
        profile = user.company_profile

        #  If Rejected
        if profile.status == CompanyProfile.Status.REJECTED:
            messages.error(
                request,
                "Your company registration has been rejected by the Placement Cell. Please contact the administrator."
            )
            return redirect("company_login")

        #  If Pending
        if profile.status == CompanyProfile.Status.PENDING:
            messages.warning(
                request,
                "Your account is still under review. Please wait for approval."
            )
            return redirect("company_login")

        #  If Deactivated
        if not profile.is_active:
            messages.error(
                request,
                "Your account has been deactivated. Please contact the administrator."
            )
            return redirect("company_login")

        #  Login success
        login(request, user)
        messages.success(request, "Login successful.")
        return redirect("companies:company_dashboard")

    return render(request, "company/pages/company_login.html")


# ==================================
# Placement cell  LOGIN
# ==================================
def pc_login(request):
    if request.method == "POST":

        username_or_email = request.POST.get("username","").strip()
        password = request.POST.get("password","").strip()

        # first try username login
        user = authenticate(request, username=username_or_email, password=password)

        # if failed, try email login
        if user is None:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        # Invalid credentials check FIRST
        if user is None:
            messages.error(request, "Invalid username/email or password.")
            return redirect("pc_login")

        #  Account active check
        if not user.is_active:
            messages.error(request, "Account is disabled.")
            return redirect("pc_login")

        #  Role check
        if user.role != "placement_cell":
            messages.error(request, "Access denied. Not a Placement Officer account.")
            return redirect("pc_login")

        #  Login success
        login(request, user)
        messages.success(request, "Login successful.")
        return redirect("placement_cell:pc_dashboard")

    return render(request, "placement_cell/pages/pc_login.html")

# ==================================
# LOGOUT
# ==================================
def logout_view(request):
    user_role = getattr(request.user, "role", None) if request.user.is_authenticated else None
    logout(request)
    messages.success(request, "Logged out successfully.")
    if user_role == "student":
        return redirect("student_login")
    if user_role == "company":
        return redirect("company_login")
    if user_role == "placement_cell":
        return redirect("pc_login")
    return redirect("home")




        # if user is not None and user.role == "student":
        #     login(request,user)
        #     return redirect("student_dashboard")
        # else:
        #     messages.error(request,"Invalid credentials")

        