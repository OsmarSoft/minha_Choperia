# backend\loja\estoque\models.py
from django.db import models
from empresa.models import Empresa
from produto.models import Produto
from django.utils.text import slugify
from django.utils.crypto import get_random_string

class Estoque(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='estoques')
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE, related_name='entradas_saidas')
    quantidade = models.PositiveIntegerField()
    tipo = models.CharField(max_length=10)  # 'entrada' ou 'saída'
    slug = models.SlugField(unique=True, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True) # Quando o registro for criado, a data e hora serão salvas


    def __str__(self):
        return f'{self.produto.nome} - {self.quantidade} ({self.tipo})'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            slug_base = slugify(self.produto.nome)
            slug = slug_base
            if Estoque.objects.filter(slug=slug).exists():
                slug = f'{slug_base}-{get_random_string(5)}'
            self.slug = slug
        super(Estoque, self).save(*args, **kwargs)


