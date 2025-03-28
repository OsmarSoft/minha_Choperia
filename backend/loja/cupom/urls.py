# backend\loja\cupom\urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('cupons/', views.listar_cupons, name='listar_cupons'),
    path('cupons/aplicar/', views.aplicar_cupom, name='aplicar_cupom'),
]

'''
OBTER /cupons/
POST /cupons/aplicar/

'''