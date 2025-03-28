# backend\loja\mesa\urls.py

from django.urls import path
from . import views

urlpatterns = [
    path("mesas/", views.mesas, name="mesas"),
    path("mesas/<slug:slug>/", views.mesa_detail, name="mesa-detail"),
    path("mesas-search/", views.search_mesas, name='mesas-search'),

    # as rotas para adicionar/remover itens e cancelar pedidos são chamadas de API (mesaApi.ts), e não precisam de rotas diretas no App.tsx.
    path("mesas/<slug:slug>/adicionar-item/", views.adicionar_item_mesa, name="adicionar-item-mesa"),
    path("mesas/<slug:slug>/remover-item/", views.remover_item_mesa, name="remover-item-mesa"),
    path("mesas/<slug:slug>/cancelar-pedido/", views.cancelar_pedido, name="cancelar-pedido"),
]


