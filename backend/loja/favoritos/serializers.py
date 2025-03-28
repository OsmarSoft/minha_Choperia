# backend/loja/favoritos/serializers.py
from rest_framework import serializers
from .models import Favorito
from produto.models import Produto

class FavoritoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    produto_preco = serializers.DecimalField(source='produto.venda', max_digits=10, decimal_places=2, read_only=True)
    imagem = serializers.ImageField(source='produto.imagem', read_only=True, allow_null=True)
    descricao = serializers.CharField(source='produto.descricao', read_only=True, allow_null=True)

    class Meta:
        model = Favorito
        fields = ['id', 'usuario', 'produto', 'produto_nome', 'produto_preco', 'imagem', 'descricao', 'adicionado_em']

