from django.conf import settings
from django.db import models
from django.core.validators import RegexValidator



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
    skills = models.TextField()

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
    

