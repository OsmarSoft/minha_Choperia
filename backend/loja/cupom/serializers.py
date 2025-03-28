# backend\loja\cupom\serializers.py
from rest_framework import serializers
from .models import Cupom

class CupomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cupom
        fields = ['id', 'nome', 'codigo', 'desconto', 'tipo', 'valido_ate', 'ativo', 'slug', 'criado_em']