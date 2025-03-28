# backend/loja/usuario/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.utils.crypto import get_random_string

class Usuario(models.Model):
    USER_TYPE_CHOICES = (
        ('physical', 'Physical'),
        ('online', 'Online'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=30)
    email = models.EmailField(max_length=100)  # Pode ser removido se usar user.email
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='online')
    ativo = models.BooleanField(default=False)
    slug = models.SlugField(unique=True, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug or Usuario.objects.filter(pk=self.pk).exists() and self.name != Usuario.objects.get(pk=self.pk).name:
            slug_base = slugify(self.name)
            slug = slug_base
            if Usuario.objects.filter(slug=slug).exists():
                slug = f'{slug_base}-{get_random_string(5)}'
            self.slug = slug
        super(Usuario, self).save(*args, **kwargs)

