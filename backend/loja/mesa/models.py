
# backend\loja\mesa\models.py
from django.db import models
from decimal import Decimal
from empresa.models import Empresa
from produto.models import Produto
from django.utils.text import slugify
from django.utils.crypto import get_random_string


class Mesa(models.Model):
    empresa = models.ForeignKey(Empresa, related_name='mesas', on_delete=models.CASCADE)
    numero = models.CharField(max_length=10)
    nome = models.CharField(max_length=50)
    descricao = models.TextField(blank=True, null=True)    
    status = models.CharField(max_length=10, default='Livre')
    pedido = models.PositiveIntegerField(default=0)
    # usuario = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    # produtos = models.ManyToManyField(Produto, related_name='mesas', through='pedido.Pedido')  # Referência correta com o nome do app
    # Adicione through para a relação many-to-many com a classe Pedido 
    # Para o caso de haver divião de pessoa e para armazenar o valor já pago e o número de pessoas que pagaram
    valor_pago = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    pessoas_pagaram = models.IntegerField(default=0)
    # Para controlar o valor que falta ser pago
    # faltante = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    numero_pessoas = models.IntegerField(default=1)
    slug = models.SlugField(unique=True, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    # Para controlar se o nome da mesa é numérico
    not_numerico = models.BooleanField(default=False)

    def __str__(self):
        return f'Mesa {self.numero} - {self.empresa.nome}'

    def calcular_total(self):
        total = 0
        for pedido in self.pedidos_mesa.all():  # Usando o related_name definido no modelo Pedido
            total += pedido.quantidade * pedido.produto.venda
        return total

    #
    def save(self, *args, **kwargs): # Adicionado método save para gerar slug
        if not self.slug:
            slug_base = slugify(self.nome)
            slug = slug_base
            if Mesa.objects.filter(slug=slug).exists():
                slug = f'{slug_base}-{get_random_string(5)}'
            self.slug = slug
        
        is_new = self._state.adding  # ✅ Corrigido para usar self._state.adding

        super(Mesa, self).save(*args, **kwargs)

    def adicionar_item(self, produto, quantidade):
        if not self.items.exists():
            self.pedido = self.get_next_pedido_number()
        
        # Verifica se o item já existe na mesa 
        item, created = self.items.get_or_create(produto_id=produto, defaults={'quantidade': quantidade})
        if not created: # Se o item já existir, apenas incrementa a quantidade
            item.quantidade += quantidade
            item.save()
        self.status = 'Ocupada'
        self.save()

    def remover_item(self, produto):
        item = self.items.filter(produto=produto).first()
        if item:
            item.delete()
        if not self.items.exists():
            self.status = 'Livre'
            self.pedido = 0
        self.save()

    def cancelar_pedido(self):
        self.items.all().delete()  # Deleta todos os ItemMesa associados à mesa
        self.status = 'Livre'      # Atualiza o status
        self.pedido = 0            # Reseta o pedido
        self.save()

    def get_next_pedido_number(self):
        highest_pedido = Mesa.objects.aggregate(models.Max('pedido'))['pedido__max'] or 0
        return highest_pedido + 1

class ItemMesa(models.Model):
    mesa = models.ForeignKey('Mesa', on_delete=models.CASCADE, related_name='items')
    produto_id = models.ForeignKey(Produto, on_delete=models.CASCADE)  # Renomeado de 'produto' para 'produto_id'
    quantidade = models.PositiveIntegerField(default=1)
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    produto_nome = models.CharField(max_length=100)  # Cache do nome do produto
    produto_slug = models.SlugField()  # Cache do slug do produto
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.produto_nome or not self.produto_slug:
            self.produto_nome = self.produto_id.nome
            self.produto_slug = self.produto_id.slug
        if not self.preco_unitario:
            self.preco_unitario = self.produto_id.venda
        if not self.slug:
            self.slug = f"{self.produto_slug}-{slugify(self.mesa.numero)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.produto_nome} ({self.quantidade}) - {self.mesa.nome}"

