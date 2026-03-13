from companies.models import CompanyProfile

def pending_companies_count(request):
    try:
        if request.user.is_authenticated:
            if hasattr(request.user, "role") and request.user.role == "admin":
                count = CompanyProfile.objects.filter(
                    status=CompanyProfile.Status.PENDING,
                    is_active=True
                ).count()
                return {"pending_companies_count": count}
    except Exception:
        return {}

    return {}