from django.urls import path
from . import views

urlpatterns = [
    path("student/login/", views.student_login, name="student_login"),
    path("company/login/", views.company_login, name="company_login"),
    path("placement_cell/login/", views.pc_login, name="pc_login"),

    path('student-forgot-password/', views.student_forgot_password, name='student_forgot_password'),
    path('company-forgot-password/', views.company_forgot_password, name='company_forgot_password'),
    path('pc-forgot-password/', views.pc_forgot_password, name='pc_forgot_password'),


    path("logout/",views.logout_view,name="logout"),
]
