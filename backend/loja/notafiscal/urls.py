from django.urls import path
from . import views

urlpatterns = [
    path("notasfiscais/", views.notasfiscais, name="notasfiscais"),
    path("notasfiscais/<slug:slug>/", views.notafiscal_detail, name="notafiscal-detail"),
    path("notasfiscais-search/", views.search_notasfiscais, name='notasfiscais-search'),
]