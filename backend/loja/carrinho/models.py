# backend/loja/carrinho/models.py
from django.db import models
from django.contrib.auth.models import User
from produto.models import Produto
from django.utils.text import slugify
from django.utils.crypto import get_random_string
from decimal import Decimal

class Carrinho(models.Model):
    usuario = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)  # Usa User diretamente
    sessao_id = models.CharField(max_length=100, null=True, blank=True)  # Para usuários anônimos
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True, null=True)

    def __str__(self):
        return f"Carrinho {self.slug} - {self.usuario.username if self.usuario else 'Anônimo'}"

    def save(self, *args, **kwargs):
        """Gera um slug único baseado no usuário ou sessão."""
        if not self.slug:
            base = f"carrinho-{self.usuario.username if self.usuario else self.sessao_id or 'anonimo'}"
            slug_base = slugify(base)
            slug = slug_base
            if Carrinho.objects.filter(slug=slug).exists():
                slug = f"{slug_base}-{get_random_string(5)}"
            self.slug = slug

        super().save(*args, **kwargs)

    def adicionar_item(self, produto, quantidade, empresa_id=None):
        """Adiciona ou atualiza um item no carrinho."""
        item, created = self.itens.get_or_create(
            produto=produto,
            empresa_id=empresa_id,
            defaults={
                'quantidade': quantidade,
                'preco_unitario': produto.venda or produto.custo,
                'slug': slugify(f"item-{produto.nome}-{get_random_string(5)}"),
                'produto_slug': produto_slug or produto.slug,  # Preservar o slug do produto
            }
        )
        
        if not created: 
            item.quantidade += quantidade
            item.save()

    def remover_item(self, produto):
        """Remove um item específico do carrinho."""
        item = self.itens.filter(produto=produto).first()
        if item:
            item.delete()

    def cancelar_pedido(self):
        """Cancela o carrinho, removendo todos os itens."""
        self.itens.all().delete()

    def calcular_total(self):
        """Calcula o total do carrinho baseado nos itens."""
        total = Decimal('0.00')
        for item in self.itens.all():
            total += item.subtotal()
        return total

class ItemCarrinho(models.Model):
    carrinho = models.ForeignKey(Carrinho, related_name='itens', on_delete=models.CASCADE)
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.PositiveIntegerField(default=1)
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    empresa_id = models.CharField(max_length=100, null=True, blank=True)  # Do tipo ProdutoCarrinho
    slug = models.SlugField(max_length=100, unique=True, blank=True, null=True)
    produto_slug = models.SlugField(max_length=100, blank=True, null=True)  # Novo campo para o slug do produto

    def save(self, *args, **kwargs):
        """Gera slug e define preço unitário se não estiver preenchido."""
        if not self.preco_unitario:
            self.preco_unitario = self.produto.venda or self.produto.custo
        if not self.slug:
            slug_base = slugify(f"item-{self.produto.nome}-{self.carrinho.slug}")
            slug = slug_base
            if ItemCarrinho.objects.filter(slug=slug).exists():
                slug = f"{slug_base}-{get_random_string(5)}"
            self.slug = slug
        super().save(*args, **kwargs)

    def subtotal(self):
        """Calcula o subtotal do item."""
        return self.quantidade * self.preco_unitario

    def __str__(self):
        return f"{self.produto.nome} ({self.quantidade}) - {self.carrinho}"


