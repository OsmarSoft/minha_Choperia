# backend/loja/usuario/serializers.py
from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'user', 'name', 'user_type', 'ativo', 'slug', 'is_available', 'created', 'updated']

