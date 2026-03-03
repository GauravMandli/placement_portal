from django.urls import path
from . import views

app_name = "placement_cell"


urlpatterns = [
    path("dashboard/",views.pc_dashboard,name="pc_dashboard"), 
    path("students/", views.view_students, name="view_students"),
    
    path("companies/", views.view_company, name="view_company"),

    path("company-detail/<slug:slug>/",views.company_detail_ajax,name="company_detail_ajax"),

    path("approve-companies/", views.approve_companies, name="approve_companies"),
    path("approve-company/<int:pk>/", views.approve_company, name="approve_company"),
    path("reject-company/<int:pk>/", views.reject_company, name="reject_company"),
    
    path("requirements/", views.view_requirements, name="view_requirements"),
    path("shortlisted/", views.shortlisted_Students, name="shortlisted_students"),
    path("selected/", views.selected_students, name="selected_students"),
    path("contact/", views.view_contacts, name="view_contacts"),

    path("delete-student/<int:pk>/", views.delete_student, name="delete_student"),
    
    path("download-resumes/",views.download_branch_resumes,name="download_branch_resumes"),
    path("download-company-certificates/",views.download_company_certificates,name="download_company_certificates"),

]

