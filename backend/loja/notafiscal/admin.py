from django.contrib import admin
from .models import NotaFiscal

class NotaFiscalAdmin(admin.ModelAdmin):
    list_display = ["empresa", "serie", "numero", "descricao", "data", "slug", "is_available", "created", "updated"]
    list_filter = ["empresa", "is_available"]
    search_fields = ["empresa", "serie", "numero", "descricao"]

admin.site.register(NotaFiscal, NotaFiscalAdmin)