from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from django.utils.html import format_html



# Register your models here.


class CustomUserAdmin(UserAdmin):

    
    list_filter = ("role", "is_staff")
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role_badge",      
        "is_staff",
    )
    fieldsets = UserAdmin.fieldsets + (
        ("Custom Fields", {"fields": ("role",)}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {"fields": ("role",)}),
    )



    def role_badge(self, obj):

        # Admin users
        if obj.is_superuser or obj.is_staff:
            color = "#dc3545"  # red
            role = "Admin"

        elif obj.role == "student":
            color = "#28a745"  # green
            role = "Student"

        elif obj.role == "company":
            color = "#007bff"  # blue
            role = "Company"

        elif obj.role == "placement_cell":
            color = "#fd7e14"  # orange
            role = "Placement Cell"

        else:
            color = "#6c757d"
            role = "User"

        return format_html(
            '<span style="background:{};color:white;padding:4px 10px;border-radius:10px;font-size:12px;">{}</span>',
            color,
            role
        )

    role_badge.short_description = "Role"


admin.site.register(User, CustomUserAdmin)
