
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.utils.crypto import get_random_string
from produto.models import Produto
from mesa.models import Mesa
from carrinho.models import Carrinho
from empresa.models import Empresa

class Pedido(models.Model):
    usuario = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    carrinho = models.ForeignKey(Carrinho, null=True, blank=True, on_delete=models.SET_NULL)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[('pendente', 'Pendente'), ('em-andamento', 'Em Andamento'), ('entregue', 'Entregue'), ('cancelado', 'Cancelado')],
        default='pendente'
    )
    total = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pagamento = models.CharField(max_length=50, null=True, blank=True)
    desconto_aplicado = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    origem = models.CharField(max_length=10, choices=[('online', 'Online'), ('fisica', 'Física')], default='online')
    slug = models.SlugField(unique=True, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            slug_base = slugify(f'pedido-{self.id or "temp"}-{get_random_string(5)}')
            slug = slug_base
            if Pedido.objects.filter(slug=slug).exists():
                slug = f'{slug_base}-{get_random_string(5)}'
            self.slug = slug
        if self.carrinho:
            self.origem = 'online'
        super().save(*args, **kwargs)

class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, related_name='itens', on_delete=models.CASCADE)
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.PositiveIntegerField()
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    slug = models.SlugField(unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        self.total = self.quantidade * self.preco_unitario
        if not self.slug:
            slug_base = slugify(f'item-{self.produto.nome}-{get_random_string(5)}')
            self.slug = slug_base
        super().save(*args, **kwargs)
