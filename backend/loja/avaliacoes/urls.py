# backend\loja\avaliacoes\urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('avaliacoes/usuario/', views.listar_avaliacoes_usuario, name='listar_avaliacoes_usuario'),
    path('avaliacoes/produto/<str:produto_id>/', views.listar_avaliacoes_produto, name='listar_avaliacoes_produto'),
    path('avaliacoes/criar/', views.criar_avaliacao, name='criar_avaliacao'),
    path('avaliacoes/editar/<str:slug>/', views.editar_avaliacao, name='editar_avaliacao'),
    path('avaliacoes/remover/<str:slug>/', views.remover_avaliacao, name='remover_avaliacao'),
    path('avaliacoes/media/<str:produto_id>/', views.media_avaliacoes, name='media_avaliacoes'),
]

"""

OBTER /avaliacoes/usuario/
GET /avaliacoes/produto/<produto_id>/
POST /avaliacoes/criar/
PUT /avaliacoes/<slug>/editar/
DELETE /avaliacoes/<slug>/remover/
GET /avaliacoes/media/<produto_id>/
"""