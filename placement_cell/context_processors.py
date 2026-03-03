from companies.models import CompanyProfile

def pending_companies_count(request):
    if request.user.is_authenticated and request.user.role == "admin":
        count = CompanyProfile.objects.filter(
            status=CompanyProfile.Status.PENDING,
            is_active=True).only("id").count()
        return {
            "pending_companies_count": count
        }
    return {}