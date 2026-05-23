from django.conf import settings
from django.db import models
from django.core.validators import RegexValidator
from jobs.models import JobRequirement


phone_validator = RegexValidator(
    regex=r'^\d{10}$',
    message="Enter a valid 10-digit mobile number."
)

# Create your models here.


class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    #personal detial field
    phone = models.CharField(max_length=10,unique=True,validators=[phone_validator])
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)


    #acadmic detail
    course = models.CharField(max_length=100)
    year = models.CharField(max_length=50)
    enroll_number = models.CharField(max_length=50,unique=True)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    skills = models.TextField(help_text="Comma separated skills")

    #passport photo
    passport_photo = models.FileField(upload_to='passport_photo/')

    #Social Links
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    portfolio = models.URLField(blank=True, null=True)

    #resume
    resume = models.FileField(upload_to='resume/')

    def __str__(self):
        return self.user.username
    

class JobApplication(models.Model):

    class Status(models.TextChoices):
        APPLIED = "APPLIED", "Applied"
        REJECTED = "REJECTED", "Rejected"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        SHORTLISTED = "SHORTLISTED", "Shortlisted"
        SHORTLIST_REJECTED = "SHORTLIST_REJECTED", "Rejected After Shortlist"
        INTERVIEW = "INTERVIEW", "Interview Scheduled"
        INTERVIEW_HOLD = "INTERVIEW_HOLD", "Interview Hold"
        INTERVIEW_REJECTED = "INTERVIEW_REJECTED", "Rejected After Interview"
        SELECTED = "SELECTED", "Selected"

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    job = models.ForeignKey(
        JobRequirement,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPLIED,
        db_index=True
    )
    remarks = models.TextField(blank=True, null=True)
    class Meta:
        ordering = ["-applied_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["student", "job"],
                name="unique_student_job_application"
            )
        ]

        indexes = [
            models.Index(fields=["student", "status"]),
            models.Index(fields=["job", "status"]),
        ]

    def __str__(self):
        return f"{self.student.user.username} → {self.job.job_title}"
    

