# backend/loja/favoritos/models.py
from django.db import models
from django.contrib.auth.models import User
from produto.models import Produto

class Favorito(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)  # Usa User
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    adicionado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'produto')

