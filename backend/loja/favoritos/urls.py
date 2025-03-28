#  backend\loja\favoritos\urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('favoritos/', views.listar_favoritos, name='listar_favoritos'),
    path('favoritos/adicionar/', views.adicionar_favorito, name='adicionar_favorito'),
    path('favoritos/remover/<str:produto_id>/', views.remover_favorito, name='remover_favorito'),
]

"""

OBTER /favoritos/
POST /favoritos/adicionar/
DELETE /favoritos/remover/<produto_id>/
"""