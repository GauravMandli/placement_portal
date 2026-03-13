from django.contrib import admin
from .models import StudentProfile
# Register your models here.

@admin.register(StudentProfile)#student profile model admin ma register
#admin.site.register(StudentProfile)

class StudentProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "first_name",
        "last_name",
        "course",
        "year",
        "cgpa"
    )

    search_fields = (
        "user__username",
        "enroll_number",
        "course"
    )

    def first_name(self, obj):
        return obj.user.first_name

    def last_name(self, obj):
        return obj.user.last_name
