# backend\loja\notafiscal\models.py
from django.db import models
from empresa.models import Empresa
from django.utils.text import slugify
from django.utils.crypto import get_random_string

class NotaFiscal(models.Model):
    # A nota fiscal pertence a uma empresa. Portanto a empresa é a chave estrangeira da nota fiscal e será excluída se a empresa for excluída 
    # Por isso foi utilizado o on_delete=models.CASCADE
    # Dessa forma, a nota fiscal não pode existir sem uma empresa associada a ela 
    # Então, a empresa é obrigatória para a nota fiscal. 
    # Assim a relação entre Empresa e NotaFiscal deve ser que uma Empresa possui várias NotaFiscal, e não o contrário. 
    # Portanto, a chave estrangeira Empresa deve ser adicionada ao modelo NotaFiscal
    empresa = models.ForeignKey(Empresa, related_name='notas_fiscais', on_delete=models.CASCADE)
    serie = models.CharField(max_length=20)
    numero = models.CharField(max_length=20)
    descricao = models.TextField()
    data = models.DateField()
    slug = models.SlugField(unique=True, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True) # Quando o registro for criado, a data e hora serão salvas
    updated = models.DateTimeField(auto_now=True) # Sempre que o registro for atualizado, a data e hora serão salvas

    def __str__(self):
        return f'{self.serie} - {self.numero}'
    
    def save(self, *args, **kwargs):
        if not self.slug or NotaFiscal.objects.filter(pk=self.pk).exists() and self.serie != NotaFiscal.objects.get(pk=self.pk).serie:
            slug_base = slugify(self.serie)
            slug = slug_base
            if NotaFiscal.objects.filter(slug=slug).exists():
                slug = f'{slug_base}-{get_random_string(5)}'
            self.slug = slug
        super(NotaFiscal, self).save(*args, **kwargs)



