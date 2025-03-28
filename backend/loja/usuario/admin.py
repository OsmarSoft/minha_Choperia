# backend/loja/usuario/admin.py
from django.contrib import admin
from .models import Usuario

class UsuarioAdmin(admin.ModelAdmin):
    list_display = ["user", "user_type", "name", "ativo", "slug", "created", "updated"]
    list_filter = ["user_type", "ativo"]
    search_fields = ["user__username", "user__first_name", "user__last_name", "user__email", "name"]

    def user(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name} ({obj.user.email})"
    user.short_description = "Usuário"

admin.site.register(Usuario, UsuarioAdmin)

