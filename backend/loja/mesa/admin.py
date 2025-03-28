# backend\loja\mesa\admin.py
from django.contrib import admin
from .models import Mesa, ItemMesa

class MesaAdmin(admin.ModelAdmin):
    list_display = ["id", "empresa", "numero", "nome", "status", "pedido", "valor_pago", "pessoas_pagaram", "numero_pessoas", "slug", "is_available", "created", "updated"]
    list_filter = ["empresa", "status", "is_available"]
    search_fields = ["empresa__nome", "numero", "nome", "descricao"]

class ItemMesaAdmin(admin.ModelAdmin):
    list_display = ["id", "mesa", "produto_nome", "quantidade", "preco_unitario", "produto_slug", "slug"]
    list_filter = ["mesa__empresa", "mesa__status"]
    search_fields = ["produto_nome", "mesa__numero", "mesa__nome", "produto_slug"]
    list_editable = ["quantidade"]  # Permite edição direta da quantidade na lista
    list_per_page = 20  # Limita a 20 itens por página para melhor navegação

    # Opcional: Mostra o nome da empresa junto com a mesa no campo mesa
    def mesa_display(self, obj):
        return f"{obj.mesa.numero} - {obj.mesa.empresa.nome}"
    mesa_display.short_description = "Mesa (Empresa)"
    
    # Opcional: Adiciona um filtro personalizado por produto
    list_filter = ["mesa__empresa", "mesa__status", ("produto_id", admin.RelatedOnlyFieldListFilter)]

admin.site.register(Mesa, MesaAdmin)
admin.site.register(ItemMesa, ItemMesaAdmin)