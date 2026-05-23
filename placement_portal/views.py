from django.shortcuts import render
from placement_cell.models import ContactMessage
from placement_cell.forms import ContactForm
from django.contrib import messages
from django.shortcuts import redirect

def custom_404(request, exception):
    return render(request, "errors/404.html", status=404)

def custom_500(request):
    return render(request, "errors/500.html", status=500)

def home(request):
    """
    Render the homepage of the website.
    """
    return render(request, 'visitor/pages/home.html')


def policies(request):
    """
    Display the policies page including terms and conditions.
    """
    return render(request, 'visitor/pages/policies.html')


def team(request):
    """
    Render the team page showing organization members.
    """
    return render(request, 'visitor/pages/team.html')


#contct view 
def contact_view(request):

    form = ContactForm(request.POST or None)

    template_map = {
        "student": "student/pages/placement_contact.html",
        "company": "company/pages/pc_contact.html",
    }

    template = next(
        (tpl for key, tpl in template_map.items() if key in request.path),
        "visitor/pages/contact.html"
    )

    if request.method == "POST":

        # Checkbox validation
        if not request.POST.get("agree"):
            messages.error(request, "Please accept the terms before submitting.")
            return render(request, template, {"form": form})   # ✅ FIX

        if form.is_valid():
            contact_message = form.save(commit=False)

            if request.user.is_authenticated:
                if request.user.role == "student":
                    contact_message.role = ContactMessage.Role.STUDENT
                elif request.user.role == "company":
                    contact_message.role = ContactMessage.Role.COMPANY
                      # 🔥 MAIN LINE (IMPORTANT)
                    contact_message.company = request.user.company_profile
                else:
                    contact_message.role = ContactMessage.Role.VISITOR
            else:
                contact_message.role = ContactMessage.Role.VISITOR

            contact_message.save()

            messages.success(request, "Your message has been sent successfully!")
            return redirect(request.path)   # ✅ OK for success

        else:
            messages.error(request, "Please correct the errors below.")
            return render(request, template, {"form": form})   # ✅ FIX

    profile = None

    if request.user.is_authenticated and request.user.role == "student":
        from students.models import StudentProfile
        profile = StudentProfile.objects.filter(user=request.user).first()

    return render(request, template, {
        "form": form,
        "profile": profile,
        "page_title": "Placement Cell Contact",  
        "active_page": "contact",    
    })