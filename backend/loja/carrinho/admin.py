from django.contrib import admin
from .models import Carrinho, ItemCarrinho

class ItemCarrinhoInline(admin.TabularInline):
    model = ItemCarrinho
    extra = 1

@admin.register(Carrinho)
class CarrinhoAdmin(admin.ModelAdmin):
    list_display = ('slug', 'usuario', 'sessao_id', 'criado_em', 'atualizado_em')
    search_fields = ('slug', 'usuario__username', 'sessao_id')
    inlines = [ItemCarrinhoInline]

@admin.register(ItemCarrinho)
class ItemCarrinhoAdmin(admin.ModelAdmin):
    list_display = ('slug', 'produto', 'quantidade', 'preco_unitario', 'carrinho', 'empresa_id', 'produto_slug')
    search_fields = ('produto__nome', 'carrinho__slug')
