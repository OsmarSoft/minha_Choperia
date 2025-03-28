from django.contrib import admin
from .models import Estoque

class EstoqueAdmin(admin.ModelAdmin):
    list_display = ["empresa", "produto", "quantidade", "tipo", "slug", "created"]
    list_filter = ["empresa", "produto", "tipo"]
    search_fields = ["empresa__nome", "produto__nome"]

admin.site.register(Estoque, EstoqueAdmin)


