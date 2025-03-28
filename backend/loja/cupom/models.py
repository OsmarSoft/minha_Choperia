# backend/loja/cupom/models.py
from django.db import models

class Cupom(models.Model):
    nome = models.CharField(max_length=100)
    desconto = models.DecimalField(max_digits=10, decimal_places=2)
    tipo = models.CharField(max_length=20, choices=[('percentual', 'Percentual'), ('fixo', 'Fixo')])
    valido_ate = models.DateTimeField()
    ativo = models.BooleanField(default=True)
    slug = models.SlugField(unique=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.codigo
