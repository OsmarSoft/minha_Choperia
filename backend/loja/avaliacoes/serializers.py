# backend\loja\avaliacoes\serializers.py
from rest_framework import serializers
from .models import Avaliacao

class AvaliacaoSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)

    class Meta:
        model = Avaliacao
        fields = ['id', 'usuario', 'usuario_nome', 'produto', 'produto_nome', 'rating', 'comentario', 'data', 'atualizado_em', 'slug']

