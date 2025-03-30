from django.contrib import admin
from .models import Favorito

class FavoritoAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'produto', 'adicionado_em']
    list_filter = ["usuario", "adicionado_em"]
    search_fields = ["usuario", "produto__nome"]

admin.site.register(Favorito, FavoritoAdmin)
