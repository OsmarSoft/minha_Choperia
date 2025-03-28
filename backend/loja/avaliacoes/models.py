# backend/loja/avaliacoes/models.py
from django.db import models
from django.contrib.auth.models import User
from produto.models import Produto

class Avaliacao(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)  # Usa User
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField()  # 1 a 5
    comentario = models.TextField()
    data = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(f"{self.usuario.id}-{self.produto.id}-{self.data}")
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ('usuario', 'produto')


