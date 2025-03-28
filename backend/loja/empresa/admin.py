from django.contrib import admin
from .models import Empresa

class EmpresaAdmin(admin.ModelAdmin):
    list_display = ["nome", "endereco", "telefone", "email", "cnpj", "slug", "is_available", "created", "updated"]
    list_filter = ["nome", "is_available"]
    search_fields = ["nome", "endereco", "telefone", "email", "cnpj"]

admin.site.register(Empresa, EmpresaAdmin)
