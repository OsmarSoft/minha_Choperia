from django.urls import path
from . import views

urlpatterns = [
    path("empresas/", views.empresas, name="empresas"),
    path("empresas/<slug:slug>/", views.empresa_detail, name="empresa-detail"),
    path("empresas-search/", views.search_empresas, name='empresas-search'),
]