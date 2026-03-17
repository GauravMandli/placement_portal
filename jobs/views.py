from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import JobRequirementForm
from companies.models import CompanyProfile

# Create your views here.

@login_required
def add_requirements(request):

    # 🔹 Only company allowed
    if request.user.role != "company":
        messages.error(request, "Access denied.")
        return redirect("company_login")

    if request.method == "POST":

        form = JobRequirementForm(request.POST, request.FILES)

        if form.is_valid():

            requirement = form.save(commit=False)

            # attach company
            requirement.company = request.user.company_profile

            requirement.save()

            messages.success(request, "Job requirement added successfully.")

            return redirect("companies:company_dashboard")

        else:
            messages.error(request, "Please correct the errors below.")

    else:
        form = JobRequirementForm()

    context = {
        "form": form
    }

    return render(request, "company/add_requirements.html", context)