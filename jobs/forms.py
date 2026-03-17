from django import forms
from .models import JobRequirement


class JobRequirementForm(forms.ModelForm):

    class Meta:
        model = JobRequirement

        fields = [
            "job_title",
            "job_type",
            "description",
            "skills",
            "eligibility",
            "salary",
            "vacancies",
            "location",
            "selection_process",
            "last_date",
            "job_pdf",
        ]

        labels = {
            "job_title": "Job Title",
            "job_type": "Job Type",
            "description": "Job Description",
            "skills": "Required Skills",
            "eligibility": "Eligibility Criteria",
            "salary": "Salary Package",
            "vacancies": "Number of Vacancies",
            "location": "Job Location",
            "selection_process": "Selection Process",
            "last_date": "Application Deadline",
            "job_pdf": "Upload Job Description PDF",
        }

        #form field ne HTML ma kem display karvu,Widget = HTML input type

        widgets = {

            "job_title": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Enter job title"
            }),

            "job_type": forms.Select(attrs={
                "class": "form-select"
            }),

            "description": forms.Textarea(attrs={
                "class": "form-control",
                "rows": 4,
                "placeholder": "Describe job responsibilities"
            }),

            "skills": forms.Textarea(attrs={
                "class": "form-control",
                "rows": 3,
                "placeholder": "Python, Django, React etc."
            }),

            "eligibility": forms.Textarea(attrs={
                "class": "form-control",
                "rows": 3
            }),

            "salary": forms.TextInput(attrs={
                "class": "form-control"
            }),

            "vacancies": forms.NumberInput(attrs={
                "class": "form-control",
                "min": 1
            }),

            "location": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "City / Remote"
            }),

            "selection_process": forms.Textarea(attrs={
                "class": "form-control",
                "rows": 3
            }),

            "last_date": forms.DateInput(attrs={
                "class": "form-control",
                "type": "date"
            }),

            "job_pdf": forms.ClearableFileInput(attrs={
                "class": "form-control"
            }),
        }