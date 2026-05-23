from django.urls import path
from . import views

app_name = "companies"

urlpatterns = [
    path("register/",views.company_register,name="company_register"),     
    path("dashboard/",views.company_dashboard,name="company_dashboard"), 
    path("update-details/", views.cmp_update_details, name="cmp_update_details"),
    path("add-requirements/", views.add_requirements, name="add_requirements"),
    path("current-requirements/", views.current_requirements, name="current_requirements"),
   
    path("applied-students/<int:job_id>/", views.applied_students, name="applied_students"),
    path('student-details/<int:pk>/', views.student_details_ajax, name='student_details_ajax'),
    path("update-status/", views.update_application_status, name="update_application_status"),
    
    path("shortlisted-students/", views.shortlisted_students, name="shortlisted_students"),
    path("schedule-interview/", views.schedule_interview, name="schedule_interview"),   
    path("interview-shortlisted/", views.interview_shortlisted, name="interview_shortlisted"),

    path("interview-details/<int:app_id>/", views.interview_details_ajax, name='interview_details_ajax'),

    path("selected-students/", views.selected_students, name="selected_students"),
    path("old-requirements/", views.old_requirements, name="old_requirements"),
    path("placement-cell-contact/", views.pc_contact, name="pc_contact"),

]