# backend/loja/produto/models.py
from django.db import models
from django.utils.text import slugify
from django.utils.crypto import get_random_string
from empresa.models import Empresa
from categoria.models import Categoria
from django.apps import apps
from django.utils import timezone

class Produto(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    custo = models.DecimalField(max_digits=10, decimal_places=2)
    venda = models.DecimalField(max_digits=10, decimal_places=2)
    codigo = models.CharField(max_length=50, unique=True)
    estoque = models.IntegerField(default=0)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, default='OUTROS', related_name='produtos')
    imagem = models.URLField(blank=True, null=True, default='https://images.unsplash.com/photo-1583744513233-64c7d1aec5c1')
    slug = models.SlugField(unique=True, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome

    def save(self, *args, **kwargs):
        if not self.slug:
            slug_base = slugify(self.nome)
            slug = slug_base
            if Produto.objects.filter(slug=slug).exists():
                slug = f'{slug_base}-{get_random_string(5)}'
            self.slug = slug

        is_new = self._state.adding  # ✅ Corrigido para usar self._state.adding

        super(Produto, self).save(*args, **kwargs)

        # Criar registro de entrada no estoque apenas na criação
        if is_new:
            Estoque = apps.get_model('estoque', 'Estoque')  # Resolvendo a importação circular
            Estoque.objects.create(
                empresa=self.empresa,
                produto=self,
                quantidade=self.estoque,
                tipo='entrada',
            )


