# backend\loja\produto\urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("produtos/", views.produtos, name="produtos"),
    path("produtos/<slug:slug>/", views.produto_detail, name="produto-detail"),
    path("produtos-search/", views.search_produtos, name='produtos-search'),
    path('produtos/<slug:slug>/decrementar-estoque/', views.decrementar_estoque, name='decrementar-estoque'),
    path('produtos/<slug:slug>/incrementar-estoque/', views.incrementar_estoque, name='incrementar-estoque'),
    path('produtos/id/<int:id>/', views.produto_por_id, name='produto-por-id'),  # Nova rota para buscar por ID
]



