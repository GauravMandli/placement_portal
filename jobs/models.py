from django.db import models
from django.contrib.auth import get_user_model
from companies.models import CompanyProfile   
from django.utils import timezone



User = get_user_model()
# Create your models here.


class JobRequirement(models.Model):

    class JobStatus(models.TextChoices):
        UPCOMING = "UPCOMING", "Upcoming"
        OPEN = "OPEN", "Open"
        EXPIRED = "EXPIRED", "Expired"
        DRAFT = "DRAFT", "Draft"
        

    company = models.ForeignKey(
        CompanyProfile,
        on_delete=models.CASCADE,
        related_name="job_requirements"
    )

    job_title = models.CharField(max_length=200)
    job_type = models.CharField(max_length=50)

    description = models.TextField()

    skills = models.TextField()
    eligibility = models.TextField()

    salary = models.CharField(max_length=100)

    vacancies = models.PositiveIntegerField()

    location = models.CharField(max_length=200)

    selection_process = models.TextField()

    start_date = models.DateField(
        default=timezone.now
    )


    last_date = models.DateField()

    job_pdf = models.FileField(
        upload_to="job_pdfs/",
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=10,
        choices=JobStatus.choices,
        default=JobStatus.OPEN
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Job Requirement"
        verbose_name_plural = "Job Requirements"

    def __str__(self):
        return f"{self.job_title} - {self.company.company_name}"
    
    @property
    def dynamic_status(self):
        today = timezone.now().date()

        # Draft
        if self.status == self.JobStatus.DRAFT:
            return "DRAFT"

        # Upcoming
        if self.start_date and today < self.start_date:
            return "UPCOMING"

        # Open
        if self.last_date and today <= self.last_date:
            return "OPEN"

        # Closed
        return "EXPIRED"


class JobRequirementAttachment(models.Model):
    job = models.ForeignKey(
        JobRequirement,
        on_delete=models.CASCADE,
        related_name="attachments"
    )
    file = models.FileField(upload_to="job_pdfs/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["uploaded_at", "id"]

    def __str__(self):
        return f"{self.job.job_title} - {self.file.name}"