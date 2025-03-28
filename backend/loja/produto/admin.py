from django.contrib import admin
from .models import Produto

class ProdutoAdmin(admin.ModelAdmin):
    list_display = ["nome", "categoria", "custo", "venda", "estoque", "codigo", "is_available", "created", "updated"]
    list_filter = ["categoria", "is_available"]
    search_fields = ["nome", "descricao"]

admin.site.register(Produto, ProdutoAdmin)
