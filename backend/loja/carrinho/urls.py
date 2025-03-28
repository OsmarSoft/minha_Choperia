# backend\loja\carrinho\urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("carrinhos/", views.carrinhos, name="carrinhos"),
    path("carrinhos/<slug:slug>/", views.carrinho_detail, name="carrinho-detail"),
    path("carrinhos-search/", views.search_carrinhos, name='carrinhos-search'),

    # as rotas para adicionar/remover itens e cancelar pedidos são chamadas de API (carrinhoApi.ts), e não precisam de rotas diretas no App.tsx.
    path("carrinhos/<slug:slug>/adicionar-item/", views.adicionar_item_carrinho, name="adicionar-item-carrinho"),
    path("carrinhos/<slug:slug>/remover-item/", views.remover_item_carrinho, name="remover-item-carrinho"),
    path("carrinhos/<slug:slug>/cancelar-pedido/", views.cancelar_pedido, name="cancelar-pedido"),
    path("carrinhos/<slug:slug>/atualizar-item/", views.atualizar_item_carrinho, name="atualizar-item-carrinho"),
]

'''
POST /carrinho/adicionar/
DELETE /carrinho/remover/<item_id>/
PUT /carrinho/atualizar/<item_id>/
DELETE /carrinho/limpar/
OBTER /carrinho/

'''