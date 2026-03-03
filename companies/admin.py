from django.contrib import admin
from .models import CompanyProfile
# Register your models here.

@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):

    list_display = (
        "company_name", 
        "company_email", 
        "industry",
        "phone",
        "status_badge", 
        "is_active", 
        "created_at"
        )
    
    list_filter = (
        "status",
        "is_active",
        "industry",
        "created_at"
    )
    
    search_fields = (
        "company_name",
        "company_email",
        "industry",
    )
    
    ordering = ("-created_at",)

    readonly_fields = ("created_at", "updated_at")

    actions = [
        "approve_companies", 
        "reject_companies"
        ]

        # 🔹 Status Badge UI
    def status_badge(self, obj):
        colors = {
            "pending": "#f0ad4e",
            "approved": "#5cb85c",
            "rejected": "#d9534f",
        }
        return format_html(
            '<span style="color:white; background:{}; padding:4px 10px; border-radius:6px;">{}</span>',
            colors.get(obj.status, "gray"),
            obj.get_status_display()
        )
    status_badge.short_description = "Status"


      # Approve
    def approve_companies(self, request, queryset):
        updated = queryset.update(status=CompanyProfile.Status.APPROVED)
        self.message_user(request, f"{updated} companies approved successfully.")
    approve_companies.short_description = "Mark selected companies as Approved"

    # Reject
    def reject_companies(self, request, queryset):
        updated = queryset.update(status=CompanyProfile.Status.REJECTED)
        self.message_user(request, f"{updated} companies rejected.")
    reject_companies.short_description = "Mark selected companies as Rejected"

    # Deactivate
    def deactivate_companies(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} companies deactivated.")
    deactivate_companies.short_description = "Deactivate selected companies"