from django.urls import path
from . import views

app_name = "companies"

urlpatterns = [
    path("register/",views.company_register,name="company_register"),     
    path("dashboard/",views.company_dashboard,name="company_dashboard"), 
    path("update-details/", views.cmp_update_details, name="cmp_update_details"),
    path("add-requirements/", views.add_requirements, name="add_requirements"),
    path("current-requirements/", views.current_requirements, name="current_requirements"),
    path("shortlisted-students/", views.shortlisted_students, name="shortlisted_students"),
    path("selected-students/", views.selected_students, name="selected_students"),
    path("old-requirements/", views.old_requirements, name="old_requirements"),
    path("placement-cell-contact/", views.pc_contact, name="pc_contact"),



]