from django.contrib import admin
from .models import Pedido, ItemPedido

class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 1

class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'carrinho', 'status', 'total', 'created', 'updated')
    list_filter = ('status', 'created', 'updated')
    search_fields = ('usuario__username', 'mesa__nome', 'status')
    inlines = [ItemPedidoInline]

admin.site.register(Pedido, PedidoAdmin)
admin.site.register(ItemPedido)
