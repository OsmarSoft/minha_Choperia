# backend/loja/usuario/serializers.py
from rest_framework import serializers
from .models import Usuario, UserToken

class UserTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserToken
        fields = ['access_token', 'refresh_token', 'created_at', 'updated_at']

class UsuarioSerializer(serializers.ModelSerializer):
    token = serializers.SerializerMethodField()  # Campo personalizado para o access_token

    class Meta:
        model = Usuario
        fields = ['id', 'user', 'name', 'user_type', 'ativo', 'slug', 'is_available', 'created', 'updated', 'token']

    def get_token(self, obj):
        try:
            user_token = UserToken.objects.get(user=obj.user)
            return user_token.access_token
        except UserToken.DoesNotExist:
            return None


