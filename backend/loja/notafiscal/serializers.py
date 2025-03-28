from rest_framework import serializers
from .models import NotaFiscal

class NotaFiscalSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotaFiscal
        fields = ['id', 'empresa', 'serie', 'numero', 'descricao', 'data', 'slug', 'is_available', 'created', 'updated']

