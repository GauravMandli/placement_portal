from django.urls import path
from . import views

urlpatterns = [
    path("register/",views.student_register,name="student_register"),   
    path("dashboard/", views.student_dashboard, name="student_dashboard"),
   
    path("update-details/", views.update_details, name="update_details"),
   
    path("job-listing/", views.job_listing, name="job_listing"),
    path('apply-job/<int:job_id>/', views.apply_job, name="apply_job"),
    path("applied-jobs/", views.applied_jobs, name="applied_jobs"),
   
    path("shortlisted-company/", views.shortlisted_company, name="shortlisted_company"),
   
    path('my-interviews/', views.interview_schedule, name='interview_schedule'),
    path("interview-details/<int:app_id>/",views.student_interview_details_ajax,name="student_interview_details"),
    
    path("selected-company/", views.selected_company, name="selected_company"),
    path("Past-jobs/", views.old_jobs, name="old_jobs"),
    path("contact-us/",views.placement_contact,name="placement_contact")

]