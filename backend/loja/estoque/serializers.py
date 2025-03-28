# backend/loja/estoque/serializers.py
from rest_framework import serializers
from .models import Estoque

class EstoqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estoque
        fields = ['id', "empresa", "produto", "quantidade", "tipo", "created"]

