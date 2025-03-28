# backend\loja\empresa\models.py
from django.db import models
from django.utils.text import slugify
from django.utils.crypto import get_random_string

class Empresa(models.Model):
    nome = models.CharField(max_length=100)
    endereco = models.CharField(max_length=255)
    telefone = models.CharField(max_length=20)
    email = models.EmailField()
    cnpj = models.CharField(max_length=20, unique=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True) # Quando o registro for criado, a data e hora serão salvas
    updated = models.DateTimeField(auto_now=True) # Sempre que o registro for atualizado, a data e hora serão salvas

    def __str__(self):
        return self.nome

    def save(self, *args, **kwargs):
        if not self.slug:
            slug_base = slugify(self.nome)
            slug = slug_base
            if Empresa.objects.filter(slug=slug).exists():
                slug = f'{slug_base}-{get_random_string(5)}'
            self.slug = slug
        super(Empresa, self).save(*args, **kwargs)
    


