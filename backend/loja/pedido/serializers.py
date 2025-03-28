from rest_framework import serializers
from .models import Pedido, ItemPedido
from produto.models import Produto
from produto.serializers import ProdutoSerializer

class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)

    class Meta:
        model = ItemPedido
        fields = ['id', 'produto', 'produto_nome', 'quantidade', 'preco_unitario', 'total', 'slug']

class PedidoSerializer(serializers.ModelSerializer):
    itens = ItemPedidoSerializer(many=True, read_only=True)

    class Meta:
        model = Pedido
        fields = [
            'id', 'usuario', 'status', 'total', 'metodo_pagamento',
            'desconto_aplicado', 'slug', 'empresa_id', 'itens', 'is_available', 'origem',
            'created', 'updated', 'carrinho'  # Mantemos apenas o carrinho
        ]

