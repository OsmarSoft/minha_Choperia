
from django.urls import path
from . import views

urlpatterns = [
    path("usuarios/", views.usuarios, name="usuarios"),
    path("usuarios/<slug:slug>/", views.usuario_detail, name="usuario-detail"),
    path("usuarios-search/", views.search_usuarios, name='usuarios-search'),
    path("login/", views.login, name='login'),  # Updated to match frontend url
]
