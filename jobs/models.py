from django.db import models
from django.contrib.auth import get_user_model
from companies.models import CompanyProfile   


User = get_user_model()
# Create your models here.


class JobRequirement(models.Model):

    class JobStatus(models.TextChoices):
        OPEN = "OPEN", "Open"
        CLOSED = "CLOSED", "Closed"
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
        return f"{self.job_title} - {self.company.username}"