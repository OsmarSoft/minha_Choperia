# Generated by Django 5.1.7 on 2025-03-30 01:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('categoria', '0001_initial'),
        ('empresa', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Produto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=100)),
                ('descricao', models.TextField()),
                ('custo', models.DecimalField(decimal_places=2, max_digits=10)),
                ('venda', models.DecimalField(decimal_places=2, max_digits=10)),
                ('codigo', models.CharField(max_length=50, unique=True)),
                ('estoque', models.IntegerField(default=0)),
                ('imagem', models.URLField(blank=True, default='https://images.unsplash.com/photo-1583744513233-64c7d1aec5c1', null=True)),
                ('slug', models.SlugField(blank=True, null=True, unique=True)),
                ('is_available', models.BooleanField(default=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('categoria', models.ForeignKey(default='OUTROS', on_delete=django.db.models.deletion.CASCADE, related_name='produtos', to='categoria.categoria')),
                ('empresa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='empresa.empresa')),
            ],
        ),
    ]
