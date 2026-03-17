from django.urls import path
from . import views

urlpatterns = [
    path('add-requirements/', views.add_requirements, name="add_requirements"),
]