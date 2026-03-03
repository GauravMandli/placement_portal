from django.shortcuts import render
from django.contrib.auth.decorators import login_required #when user login then function use
from django.http import HttpResponseForbidden #unauthorized hoy to access block mate
from students.models import StudentProfile
from companies.models import CompanyProfile
from jobs.models import JobRequirement
from accounts.decorators import admin_required #only admin access
from django.shortcuts import get_object_or_404, redirect #db mathi object na male to 404 error
from django.views.decorators.http import require_POST #post req thi j call thay get thi direct kare to work na akre
from django.contrib import messages #message mate
from django.db import transaction #db operation and koi eroor aave to rollbace tahy and safe 
from django.db.models import Q #complex query mate
from django.core.paginator import Paginator #large data pages ma divade
import zipfile
import os
from io import BytesIO
from django.http import HttpResponse

from django.http import JsonResponse # browser ma json  formet ma data mokle
from django.views.decorators.http import require_GET #view GET request thi j call thay



#=================================
# Create your views here.
#=================================


@login_required
@admin_required
def pc_dashboard(request):
    if request.user.role != "placement_cell":
        return HttpResponseForbidden("Unauthorized Access")
    
    context ={
        "active_page" : "dashboard",
        "page_title" : "Dashboard",
    }
    
    return render(request, "placement_cell/pages/pc_dashboard.html",context)

#=================================
#view students
#=================================
@login_required
@admin_required
def view_students(request):
    branch = request.GET.get("branch","").strip()
    search_query = request.GET.get("search", "").strip()

    students = (
        StudentProfile.objects
        .select_related("user")
        .filter(user__role="student")
        .order_by("-id")  # latest first 
    )
    # 🔹 Branch Filter (Case-insensitive)
    if branch:
        students = students.filter(course__iexact=branch)

     # 🔹 Search Filter
    if search_query:
        students = students.filter(
            Q(user__first_name__icontains=search_query) |
            Q(user__last_name__icontains=search_query) |
            Q(user__email__icontains=search_query) |
            Q(enroll_number__icontains=search_query) |
            Q(phone__icontains=search_query)
        )
    
    # 🔹 Pagination (10 per page)
    paginator = Paginator(students, 10)
    page_number = request.GET.get("page")
    students_page = paginator.get_page(page_number)


    context ={
        "active_page" : "view_students",
        "page_title" : "View Students",
        "students": students,
        "students": students_page,
        "selected_branch": branch,
        "search_query": search_query,
    }
    return render(request, "placement_cell/pages/view_students.html",context)

#=================================
#view company
#=================================
@login_required
@admin_required
def view_company(request):

    search_query = request.GET.get("search", "").strip()
    selected_industry = request.GET.get("industry", "").strip()

    companies = CompanyProfile.objects.filter(is_active=True)

    #  Industry Filter
    if selected_industry:
        companies = companies.filter(industry__iexact=selected_industry)

    #  Search Filter
    if search_query:
        companies = companies.filter(
            Q(company_name__icontains=search_query) |
            Q(address__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(company_email__icontains=search_query)
        )
 
    context ={
        "active_page" : "view_company",
        "page_title" : "View Companies",
        "companies": companies,
        "search_query": search_query,
        "selected_industry": selected_industry,
    }
    return render(request, "placement_cell/pages/view_company.html",context)

#=================================
#VIEW DETAILS CODE 
#=================================
@require_GET
@login_required
@admin_required
def company_detail_ajax(request, slug):

    company = get_object_or_404(
        CompanyProfile,
        slug=slug,
        is_active=True
    )
    data = {
        "id": company.id,
        "company_name": company.company_name,
        "industry": company.industry,
        "company_email": company.company_email,
        "phone": company.phone,
        "website": company.website,
        "description": company.description,
        "address": company.address,
        "company_size": company.company_size,
        "gst_number": company.gst_number,
        
        "contact_person_name": company.cp_name,
        "contact_email": company.cp_email,
        "contact_phone": company.cp_phone,
        "designation": company.designation,
        "status": company.get_status_display(),
        "certificate_url": company.reg_certificate.url if company.reg_certificate else "",
        "created_at": company.created_at.strftime("%d %b %Y"),
    }

    return JsonResponse({
        "success": True,
        "data": data
    })




#=================================
# LIST approve PENDING COMPANIES
#==================================
@login_required
@admin_required
def approve_companies(request):

    search_query = request.GET.get("search", "").strip()

    # Properly assign queryset to variable
    companies = CompanyProfile.objects.filter(
        status=CompanyProfile.Status.PENDING,
        is_active=True
    ).order_by("-created_at")

    #  Apply search filter
    if search_query:
        companies = companies.filter(
            Q(company_name__icontains=search_query) |
            Q(company_email__icontains=search_query) |
            Q(industry__icontains=search_query)
        )

    #  Pagination
    paginator = Paginator(companies, 10)
    page_number = request.GET.get("page")
    companies_page = paginator.get_page(page_number)

    context = {
        "companies": companies_page,
        "search_query": search_query,
        "active_page": "approve_companies",
        "page_title": "Approve Companies",
    }

    return render(request, "placement_cell/pages/approve_company.html", context)

#===============================
# APPROVE ACTION (POST Only )
#===============================
@require_POST
@login_required
@admin_required
def approve_company(request, pk):

    company = get_object_or_404(
        CompanyProfile,
        pk=pk,
        is_active=True
    )

    try:
        with transaction.atomic():
            company.status = CompanyProfile.Status.APPROVED
            company.save(update_fields=["status"])

        return JsonResponse({
            "success": True,
            "message": "Company approved successfully."
        })

    except Exception:
        return JsonResponse(
            {"success": False, "error": "Something went wrong."},
            status=500
        )

#================================
# REJECT ACTION 
#================================
@require_POST
@login_required
@admin_required
def reject_company(request, pk):

    company = get_object_or_404(
        CompanyProfile,
        pk=pk,
        is_active=True
    )

    try:
        with transaction.atomic():
            company.status = CompanyProfile.Status.REJECTED
            company.save(update_fields=["status"])

        return JsonResponse({
            "success": True,
            "message": "Company rejected successfully."
        })

    except Exception:
        return JsonResponse(
            {"success": False, "error": "Something went wrong."},
            status=500
        )


#=================================
#view requirements
#=================================
@login_required
@admin_required
def view_requirements(request):
    context ={
        "active_page" : "view_requirements",
        "page_title" : "View Requirements",
    }
    return render(request, "placement_cell/pages/view_requirements.html",context)

#shortlisted students
@login_required
@admin_required
def shortlisted_Students(request):
    context ={
        "active_page" : "shortlisted_students",
        "page_title" : "Shortlisted Students",
    }
    return render(request, "placement_cell/pages/shortlisted_students.html",context)

#selected students
@login_required
@admin_required
def selected_students(request):
    context ={
        "active_page" : "selected_students",
        "page_title" : "Selected Students",
    }
    return render(request, "placement_cell/pages/selected_students.html",context)

#view contacts
@login_required
@admin_required
def view_contacts(request):
    context ={
        "active_page" : "view_contacts",
        "page_title" : "View Contacts",
    }
    return render(request, "placement_cell/pages/view_contacts.html",context)



#delete student 
@require_POST
@login_required
@admin_required
def delete_student(request, pk):
    student = get_object_or_404(
        StudentProfile.objects.select_related("user"),
        pk=pk
    )

    # Extra role safety check
    if student.user.role != "student":
        messages.error(request, "You can delete only student accounts.")
        return redirect("placement_cell:view_students")

    student.user.delete()  # or student.delete()

    messages.success(request, "Student deleted successfully!")
    return redirect("placement_cell:view_students")

#=============================
# branch wise resume downlode
#============================
@login_required
@admin_required
def download_branch_resumes(request):
    
    branch = request.GET.get("branch", "").strip()
    cgpa = request.GET.get("cgpa", "").strip()


    students = (
        StudentProfile.objects
        .select_related("user")
        .filter(user__role="student")
    )

    # 🔹 Branch Filter
    if branch and branch.lower() != "all":
        students = students.filter(course__iexact=branch)

     # 🔹 CGPA Filter (Minimum Eligibility)
    if cgpa:
        try:
            students = students.filter(cgpa__gte=float(cgpa))
        except ValueError:
            pass  # ignore invalid cgpa safely


    if not students.exists():
        messages.warning(request, "No students found for selected branch.")
        return redirect("placement_cell:view_students")

    buffer = BytesIO()

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for student in students:
            if student.resume:
                try:
                    file_path = student.resume.path

                    if os.path.exists(file_path):
                        # Unique filename (avoid conflict)
                        file_name = f"{student.user.username}_{os.path.basename(file_path)}"
                        zip_file.write(file_path, file_name)

                except Exception:
                    continue  # Skip corrupted file safely

    buffer.seek(0)

    # 🔹 Dynamic File Name
    file_label = branch.lower() if branch else "all"
    cgpa_label = f"{cgpa}_plus" if cgpa else "all"

    zip_filename = f"{file_label}_students_resumes.zip"

    response = HttpResponse(buffer, content_type="application/zip")
    response["Content-Disposition"] = f'attachment; filename="{zip_filename}"'

    return response

#============================
# industry wise certificate download
#============================
@login_required
@admin_required
def download_company_certificates(request):

    industry = request.GET.get("industry", "").strip()
    search_query = request.GET.get("search", "").strip()

    companies = CompanyProfile.objects.filter(is_active=True)

    # 🔹 Industry Filter
    if industry:
        companies = companies.filter(industry__iexact=industry)

    # 🔹 Search Filter
    if search_query:
        companies = companies.filter(
            Q(company_name__icontains=search_query) |
            Q(address__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(company_email__icontains=search_query)
        )

    if not companies.exists():
        messages.warning(request, "No companies found.")
        return redirect("placement_cell:view_company")

    buffer = BytesIO()

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for company in companies:
            if company.reg_certificate:
                try:
                    file_path = company.reg_certificate.path

                    if os.path.exists(file_path):
                        file_name = f"{company.company_name}_{os.path.basename(file_path)}"
                        zip_file.write(file_path, file_name)

                except Exception:
                    continue

    buffer.seek(0)

    #  Dynamic ZIP name
    industry_label = industry.lower() if industry else "all"
    zip_filename = f"{industry_label}_company_certificates.zip"

    #  IMPORTANT — Create Response Properly
    response = HttpResponse(buffer, content_type="application/zip")
    response["Content-Disposition"] = f'attachment; filename="{zip_filename}"'

    return response