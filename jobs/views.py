from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import JobRequirementForm
from companies.models import CompanyProfile

from django.http import JsonResponse #json data return melavva
from django.shortcuts import get_object_or_404 # jobs na male to erorr
from django.views.decorators.http import require_GET # only get requiest follow
from jobs.models import JobRequirement
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404
from django.utils import timezone



# Create your views here.

@login_required
def add_requirements(request):

    # 🔹 Only company allowed
    if request.user.role != "company":
        messages.error(request, "Access denied.")
        return redirect("company_login")
      
      #  NEW CODE START (IMPORTANT)
    company = get_object_or_404(CompanyProfile, user=request.user)

    #  REJECTED
    if company.status == CompanyProfile.Status.REJECTED:
        messages.error(request, "Your account has been rejected.")
        logout(request)
        return redirect("company_login")

    #  PENDING
    if company.status == CompanyProfile.Status.PENDING:
        messages.warning(request, "Your account is under review.")
        logout(request)
        return redirect("company_login")

    # ⚠️ HOLD → block job post
    if company.status == CompanyProfile.Status.HOLD:
        messages.error(request, "You cannot post jobs right now. Please contact the Placement Cell.")
        return redirect("companies:company_dashboard")
    #  NEW CODE END

    if request.method == "POST":

        form = JobRequirementForm(request.POST, request.FILES)

        if form.is_valid():

            requirement = form.save(commit=False)

            # attach company
            requirement.company = company

            requirement.save()

            messages.success(request, "Job requirement added successfully.")

            return redirect("companies:company_dashboard")

        else:
            print("FORM ERRORS:", form.errors)
            messages.error(request, "Please correct the errors below.")

    else:
        form = JobRequirementForm()

    context = {
        "form": form
    }

    return render(request, "company/pages/add_requirements.html", context)


#==================================
# job details view 
#=================================
@require_GET
@login_required(login_url="student_login")
def job_detail_ajax(request, id):
    """
    Return job details in JSON format (AJAX).
    """

    job = get_object_or_404(
        JobRequirement.objects.select_related("company"),
        id=id,
        status=JobRequirement.JobStatus.OPEN
    )

    today = timezone.now().date()

    # 🔥 dynamic status
    if today > job.last_date:
        dynamic_status = "EXPIRED"
    elif job.start_date and today < job.start_date:
        dynamic_status = "UPCOMING"
    else:
        dynamic_status = "OPEN"

    data = {
        "id": job.id,
        "title": job.job_title,
        "company": getattr(job.company, "company_name", job.company.company_name),
        "type": job.job_type,
        "salary": job.salary,
        "vacancies": job.vacancies,
        "location": job.location,
        "skills": job.skills,
        "eligibility": job.eligibility,
        "description": job.description,
        "selection_process": job.selection_process,

        # Safe date formatting
        "start_date": job.start_date.strftime("%d %b %Y") if job.start_date else None,
        "last_date": job.last_date.strftime("%d %b %Y") if job.last_date else None,

        "dynamic_status": dynamic_status,  # ADD THIS

        # Safe file handling
        "pdf": job.job_pdf.url if job.job_pdf else None,
    }

    return JsonResponse({
        "success": True,
        "data": data
    })

