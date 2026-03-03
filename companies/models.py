from django.conf import settings
from django.db import models
from django.utils.text import slugify #utility fun je text to url frendly slug convert


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
    company_size = models.CharField(max_length=50)
    website = models.URLField()

    address = models.TextField()
    description = models.TextField()  #new

    cp_name = models.CharField(max_length=150)
    cp_email = models.EmailField(null=True, blank=True)
    cp_phone = models.CharField(max_length=15)
    designation = models.CharField(max_length=150)

    reg_certificate = models.FileField(upload_to='copmpany_certificates/')

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
    