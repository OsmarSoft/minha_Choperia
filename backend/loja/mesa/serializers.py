# backend/loja/mesa/serializers.py
from rest_framework import serializers
from .models import Mesa, ItemMesa

class ItemMesaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemMesa
        fields = ['id', 'produto_id', 'quantidade', 'preco_unitario', 'produto_nome', 'produto_slug', 'slug']

class MesaSerializer(serializers.ModelSerializer):
    items = ItemMesaSerializer(many=True, read_only=True)

    class Meta:
        model = Mesa
        fields = ['id', 'empresa', 'numero', 'nome', 'descricao', 'status', 'pedido', 'slug', 'items', 'created', 'updated', 'not_numerico']


