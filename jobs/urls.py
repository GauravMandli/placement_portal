from django.urls import path
from . import views

urlpatterns = [
    path('add-requirements/', views.add_requirements, name="add_requirements"),
    
    path("job-detail/<int:id>/", views.job_detail_ajax, name="job_detail_ajax"),
]