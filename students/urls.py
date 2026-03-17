from django.urls import path
from . import views

urlpatterns = [
    path("register/",views.student_register,name="student_register"),   
    path("dashboard/", views.student_dashboard, name="student_dashboard"),
    path("update-details/", views.update_details, name="update_details"),
    path("job-listing/", views.job_listing, name="job_listing"),
    path("applied-jobs/", views.applied_jobs, name="applied_jobs"),
    path("shortlisted-company/", views.shortlisted_company, name="shortlisted_company"),
    path("selected-company/", views.selected_company, name="selected_company"),
    path("contact-us/",views.placement_contact,name="placement_contact")

]