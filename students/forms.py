from django import forms
from .models import StudentProfile
from accounts.models import User


class StudentRegisterForm(forms.ModelForm):

    first_name = forms.CharField(max_length=100)
    last_name = forms.CharField(max_length=100)
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = StudentProfile

        fields = [
            "phone",
            "dob",
            "gender",
            "course",
            "year",
            "enroll_number",
            "cgpa",
            "skills",
            "passport_photo",
            "linkedin",
            "github",
            "portfolio",
            "resume",
        ]

        #password match check 
    def clean(self):

        cleaned_data = super().clean() #form na validation lave

        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")

        if password != confirm_password:
            raise forms.ValidationError("Passwords do not match")

        return cleaned_data
    

        # Duplicate enrollment check
    def clean_email(self):

        email = self.cleaned_data.get("email")

        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Email already registered")

        return email
    

        # Duplicate email check
    def clean_enroll_number(self):

        enroll = self.cleaned_data.get("enroll_number")

        if User.objects.filter(username=enroll).exists():
            raise forms.ValidationError("Enrollment number already registered")

        return enroll

        # CGPA validation check 
    def clean_cgpa(self):

        cgpa = self.cleaned_data.get("cgpa")

        if cgpa is not None:

            if cgpa < 0 or cgpa > 10:
                raise forms.ValidationError("CGPA must be between 0 and 10.")

        return cgpa
