# backend/loja/categoria/models.py
from django.db import models
from django.utils.text import slugify
from django.utils.crypto import get_random_string

class Categoria(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True) # Quando o registro for criado, a data e hora serão salvas
    updated = models.DateTimeField(auto_now=True) # Sempre que o registro for atualizado, a data e hora serão salvas

    def __str__(self):
        return self.nome
    
    # O método save é utilizado para criar o slug da categoria, que será utilizado para criar URLs amigáveis.
    def save(self, *args, **kwargs):
        if not self.slug: # Se o slug não foi informado
            slug_base = slugify(self.nome) # O slug será criado a partir do nome da categoria
            slug = slug_base # O slug será o nome da categoria
            if Categoria.objects.filter(slug=slug).exists(): # Se o slug já existir, será adicionado um código aleatório
                slug = f'{slug_base}-{get_random_string(5)}' # O código aleatório terá 5 caracteres
            self.slug = slug # O slug será salvo no campo slug
        super(Categoria, self).save(*args, **kwargs) # O método save original será chamado


