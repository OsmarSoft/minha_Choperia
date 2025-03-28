# backend\loja\produto\serializers.py

from rest_framework import serializers
from .models import Produto
from categoria.models import Categoria

class ProdutoSerializer(serializers.ModelSerializer):
    categoria = serializers.SlugRelatedField(slug_field='nome', queryset=Categoria.objects.all())
    venda = serializers.FloatField()  # Garante que o valor seja enviado como float
    custo = serializers.FloatField()  # Garante que o valor seja enviado como float
    class Meta:
        model = Produto
        fields = ['id', 'nome', 'descricao', 'custo', 'venda', 'codigo', 
                 'estoque', 'empresa', 'categoria', 'imagem', 'slug', 
                 'is_available', 'created', 'updated']
        

