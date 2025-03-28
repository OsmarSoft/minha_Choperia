from rest_framework import serializers
from .models import Empresa

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['id', 'nome', 'endereco', 'telefone', 'email', 'cnpj', 'slug', 'is_available', 'created', 'updated']