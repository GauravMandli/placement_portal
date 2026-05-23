from django.contrib import admin
from .models import StudentProfile,JobApplication
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
    
@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):

    list_display = (
        "student_name",
        "job_title",
        "company_name",
        "status",
        "applied_at"
    )

    list_filter = ("status", "applied_at")

    search_fields = (
        "student__user__username",
        "job__job_title",
        "job__company__company_name"
    )

    def student_name(self, obj):
        return obj.student.user.username

    def job_title(self, obj):
        return obj.job.job_title

    def company_name(self, obj):
        return obj.job.company.company_name
