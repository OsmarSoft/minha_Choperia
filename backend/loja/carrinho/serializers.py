# backend\loja\carrinho\serializers.py
from rest_framework import serializers
from .models import Carrinho, ItemCarrinho
from produto.models import Produto

class ItemCarrinhoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    produto_slug = serializers.CharField(read_only=True)  # Incluir o slug do produto

    class Meta:
        model = ItemCarrinho
        fields = ['id', 'produto', 'produto_nome', 'quantidade', 'preco_unitario', 'subtotal', 'empresa_id', 'slug', 'produto_slug']

class CarrinhoSerializer(serializers.ModelSerializer):
    itens = ItemCarrinhoSerializer(many=True, read_only=True)

    class Meta:
        model = Carrinho
        fields = ['id', 'usuario', 'sessao_id', 'criado_em', 'atualizado_em', 'itens', 'slug']

