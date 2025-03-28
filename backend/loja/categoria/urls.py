from django.urls import path
from . import views

urlpatterns = [
    path("categorias/", views.categorias, name="categorias"),
    path("categorias/<slug:slug>/", views.categoria_detail, name="categoria-detail"),
    path("categorias-search/", views.search_categorias, name='categorias-search'),
]