from django import forms
from .models import ContactMessage


class ContactForm(forms.ModelForm):
    """
    Form for handling contact message submissions.
    """

    class Meta:
        model = ContactMessage
        fields = [
            "name",
            
            "email",
            "phone",
            "subject",
            "message",
        ]
      

    def clean_name(self):
        name = self.cleaned_data.get("name")
        if not name.strip():
            raise forms.ValidationError("Name cannot be empty.")
        return name

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if not email:
            raise forms.ValidationError("Email is required.")
        return email

    def clean(self):
        cleaned_data = super().clean()

        # Example: enforce default role if not provided
        if not cleaned_data.get("role"):
            cleaned_data["role"] = ContactMessage.Role.VISITOR

        return cleaned_data
    