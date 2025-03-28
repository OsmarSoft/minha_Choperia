
# backend\loja\pedido\urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('pedidos/', views.pedidos, name='pedidos'),
    path('pedidos/<slug:slug>/', views.pedido_detail, name='pedido-detail'),
    path('pedidos-search/', views.search_pedidos, name='pedidos-search'),
    path('pedidos/criar/', views.criar_pedido, name='criar-pedido'),
    path('pedidos/historico/', views.historico_pedidos, name='historico-pedidos'),
    path('pedidos/<slug:slug>/atualizar-status/', views.atualizar_status, name='atualizar-status'),
    path('pedidos/<slug:slug>/confirmar-recebimento/', views.confirmar_recebimento, name='confirmar-recebimento'),
    path('pedidos/carrinho/<slug:carrinhoSlug>/criar/', views.criar_pedido_from_carrinho, name='criar-pedido-from-carrinho'),
]


