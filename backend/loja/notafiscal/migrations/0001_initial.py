# Generated by Django 5.1.7 on 2025-03-30 01:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('empresa', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='NotaFiscal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('serie', models.CharField(max_length=20)),
                ('numero', models.CharField(max_length=20)),
                ('descricao', models.TextField()),
                ('data', models.DateField()),
                ('slug', models.SlugField(blank=True, null=True, unique=True)),
                ('is_available', models.BooleanField(default=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('empresa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notas_fiscais', to='empresa.empresa')),
            ],
        ),
    ]
