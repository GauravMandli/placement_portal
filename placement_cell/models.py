from django.db import models
from students.models import StudentProfile
from jobs.models import JobRequirement
from companies.models import CompanyProfile
# Create your models here.

class ContactMessage(models.Model):
    """
    Model to store contact form submissions from users such as
    students, companies, and visitors.
    """
    company = models.ForeignKey(
        CompanyProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        COMPANY = "company", "Company"
        VISITOR = "visitor", "Visitor"

    name = models.CharField(
        max_length=100,
        help_text="Full name of the user"
    )

    email = models.EmailField(
        help_text="User's email address"
    )

    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Optional contact number"
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.VISITOR,
        help_text="Role of the user submitting the message"
    )

    subject = models.CharField(
        max_length=100,
        help_text="Subject of the message"
    )

    message = models.TextField(
        help_text="Detailed message content"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the message was created"
    )

    class Meta:
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.subject}"



