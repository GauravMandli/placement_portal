from django.conf import settings
from django.db import models
from django.utils.text import slugify #utility fun je text to url frendly slug convert
from django.db import models
# Create your models here.

class CompanyProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name="company_profile"
    )

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        HOLD = "hold", "On Hold"

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )

    company_name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True,null=True)

    company_email = models.EmailField()
    phone = models.CharField(max_length=15)

    gst_number = models.CharField(max_length=20, null=True, blank=True)
    industry = models.CharField(max_length=100)

    COMPANY_SIZE_CHOICES = [
        ("1-50", "1-50 Employees"),
        ("51-200", "51-200 Employees"),
        ("201-500", "201-500 Employees"),
        ("500+", "500+ Employees"),
    ]
    company_size = models.CharField(max_length=50,choices=COMPANY_SIZE_CHOICES)
    website = models.URLField()

    address = models.TextField()
    description = models.TextField()  #new

    cp_name = models.CharField(max_length=150)
    cp_email = models.EmailField(null=True, blank=True)
    cp_phone = models.CharField(max_length=15)
    designation = models.CharField(max_length=150)

    reg_certificate = models.FileField(upload_to='company_certificates/')

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["industry"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.company_name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.company_name




#shortlisted students 

class ShortlistedStudent(models.Model):

    application = models.OneToOneField(
    "students.JobApplication",   #  STRING use karo
    on_delete=models.CASCADE,
    related_name="shortlist"
    )

    remarks = models.TextField(blank=True, null=True)

    shortlisted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-shortlisted_at"]
        verbose_name = "Shortlisted Student"
        verbose_name_plural = "Shortlisted Students"

    def __str__(self):
        return f"{self.application.student.user.get_full_name()} - {self.application.job.job_title}"

#========================
#interview
#============================
class Interview(models.Model):

    class Mode(models.TextChoices):
        ONLINE = "ONLINE", "Online"
        OFFLINE = "OFFLINE", "Offline"

    application = models.OneToOneField(
        "students.JobApplication",
        on_delete=models.CASCADE,
        related_name="interview"
    )

    date = models.DateField()
    time = models.TimeField()

    mode = models.CharField(
        max_length=10,
        choices=Mode.choices
    )

    meeting_link = models.URLField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.application} - Interview"

    # 🔹 Validation
    def clean(self):
        from django.core.exceptions import ValidationError

        if self.mode == self.Mode.ONLINE and not self.meeting_link:
            raise ValidationError("Meeting link is required for online interview.")

        if self.mode == self.Mode.OFFLINE and not self.address:
            raise ValidationError("Address is required for offline interview.")
        
#=========================
#selection 
#=======================

class SelectionResult(models.Model):

    class ResultStatus(models.TextChoices):
        SELECTED = "SELECTED", "Selected"
        REJECTED = "REJECTED", "Rejected"

    application = models.OneToOneField(
        "students.JobApplication",
        on_delete=models.CASCADE,
        related_name="selection"
    )

    result = models.CharField(
        max_length=10,
        choices=ResultStatus.choices
    )

    remarks = models.TextField(blank=True, null=True)

    declared_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-declared_at"]
        verbose_name = "Selection Result"
        verbose_name_plural = "Selection Results"

    def __str__(self):
        return f"{self.application.student.user.get_full_name()} - {self.result}"