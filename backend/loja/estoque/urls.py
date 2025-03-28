# backend\loja\estoque\urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("estoques/", views.estoques, name="estoques"),
    path("estoques/<slug:slug>/", views.estoque_detail, name="estoque-detail"),
    path("estoques-search/", views.search_estoques, name='estoques-search'),    
]


