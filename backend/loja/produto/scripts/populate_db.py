# backend\loja\produto\scripts\populate_db.py
import os
import sys
import django
from decimal import Decimal
from pathlib import Path

"""
cd backend/loja
python produto/scripts/populate_db.py
"""
# TODO: Adicionar logica para inserir mesa e usuario no banco de dados. 
# TODO: Ter como base src\data\mesa_storage.ts 

# Configura o ambiente do Django
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'loja.settings')
django.setup()

from produto.models import Produto
from categoria.models import Categoria
from empresa.models import Empresa
from notafiscal.models import NotaFiscal
from estoque.models import Estoque
from mesa.models import Mesa

# Lista das categorias que devem ser criadas
CATEGORIAS_DEFAULT = [
    "BEBIDA", "COMIDA", "LANCHE", "SUCO", "TAPIOCA",
    "BALDE", "CERVEJA", "SOBREMESA", "PIZZA", "MARMITEX", "OUTROS"
]

# Lista das empresas que devem ser criadas
EMPRESAS_DEFAULT = [
    {
        "nome": "Choperia Point do Morro",
        "endereco": "Avenida Cumbica, 784 Vila Gilda 04954-203 Bairro Bom / SP",
        "telefone": "945876323",
        "email": "choperia@example.net",
        "cnpj": "57.851.872/3504-08",
        "nota_fiscal": {
            "serie": "CHOP-001",
            "numero": "1001",
            "descricao": "Nota fiscal inicial",
            "data": "2025-02-09"
        }
    },
    {
        "nome": "Choperia do Zé",
        "endereco": "Rua A, 123",
        "telefone": "123456789",
        "email": "choperia@example.com",
        "cnpj": "12345678000100",
        "nota_fiscal": {
            "serie": "CHOP-101",
            "numero": "2351",
            "descricao": "Nota fiscal inicial",
            "data": "2025-02-09"
        }
    },
    {
        "nome": "Bar do João",
        "endereco": "Rua B, 456",
        "telefone": "987654321",
        "email": "joao@exemplo.com",
        "cnpj": "12345678000200",
        "nota_fiscal": {
            "serie": "BAR-001",
            "numero": "2001",
            "descricao": "Nota fiscal inicial",
            "data": "2025-02-09"
        }
    },
]

def populate_categorias():
    """Cria categorias no banco de dados se elas não existirem."""
    for nome_categoria in CATEGORIAS_DEFAULT:
        categoria, created = Categoria.objects.get_or_create(nome=nome_categoria)
        if created:
            print(f"Categoria criada: {categoria.nome}")
        else:
            print(f"Categoria já existe: {categoria.nome}")

def populate_empresas():
    """Cria empresas e notas fiscais no banco de dados se elas não existirem."""
    for empresa_data in EMPRESAS_DEFAULT:
        try:
            empresa, created = Empresa.objects.get_or_create(
                cnpj=empresa_data["cnpj"],
                defaults={
                    "nome": empresa_data["nome"],
                    "endereco": empresa_data["endereco"],
                    "telefone": empresa_data["telefone"],
                    "email": empresa_data["email"],
                }
            )
            if created:
                print(f"Empresa criada: {empresa.nome}")
                nota_fiscal_data = empresa_data["nota_fiscal"]
                NotaFiscal.objects.create(
                    empresa=empresa,
                    serie=nota_fiscal_data["serie"],
                    numero=nota_fiscal_data["numero"],
                    descricao=nota_fiscal_data["descricao"],
                    data=nota_fiscal_data["data"]
                )
                print(f"Nota Fiscal criada para a empresa {empresa.nome}")
            else:
                print(f"Empresa já existe: {empresa.nome}")
        except Exception as e:
            print(f"❌ ERRO ao criar empresa '{empresa_data['nome']}': {e}")

def populate_produtos():
    # Lista completa com 30 produtos (mantida igual ao seu código)
    produtos = [
        {
            "nome": "Chopp Pilsen",
            "descricao": "Chopp claro, leve e refrescante com notas sutis de malte",
            "custo": Decimal('8.90'),
            "venda": Decimal('12.90'),
            "codigo": "CHOP-001",
            "estoque": 100,
            "empresa": "Choperia do Zé",
            "categoria": "CERVEJA",
            "imagem": "https://images.unsplash.com/photo-1583744513233-64c7d1aec5c1",
            "is_available": True
        },
        {
            "nome": "Chopp IPA",
            "descricao": "Chopp aromático com notas cítricas e amargor pronunciado",
            "custo": Decimal('10.90'),
            "venda": Decimal('15.90'),
            "codigo": "CHOP-002",
            "estoque": 80,
            "empresa": "Choperia do Zé",
            "categoria": "CERVEJA",
            "imagem": "https://images.unsplash.com/photo-1584225064785-c62a8b43d148",
            "is_available": True
        },
        {
            "nome": "Chopp Weiss",
            "descricao": "Chopp de trigo, refrescante com notas de banana e cravo",
            "custo": Decimal('9.90'),
            "venda": Decimal('14.90'),
            "codigo": "CHOP-003",
            "estoque": 75,
            "empresa": "Choperia do Zé",
            "categoria": "CERVEJA",
            "imagem": "https://images.unsplash.com/photo-1584225064432-13f34585bc49",
            "is_available": True
        },
        {
            "nome": "Chopp Stout",
            "descricao": "Chopp escuro, encorpado com notas de café e chocolate",
            "custo": Decimal('11.90'),
            "venda": Decimal('16.90'),
            "codigo": "CHOP-004",
            "estoque": 60,
            "empresa": "Choperia do Zé",
            "categoria": "CERVEJA",
            "imagem": "https://images.unsplash.com/photo-1584225064784-61ef9a8b2b07",
            "is_available": True
        },
        {
            "nome": "Chopp Red Ale",
            "descricao": "Chopp vermelho com notas de caramelo e malte torrado",
            "custo": Decimal('10.90'),
            "venda": Decimal('15.90'),
            "codigo": "CHOP-005",
            "estoque": 70,
            "empresa": "Choperia do Zé",
            "categoria": "CERVEJA",
            "imagem": "https://images.unsplash.com/photo-1584225064775-863933c1b5c0",
            "is_available": True
        },
        {
            "nome": "Porção de Batatas Fritas",
            "descricao": "Batatas fritas crocantes com tempero especial da casa",
            "custo": Decimal('15.90'),
            "venda": Decimal('25.90'),
            "codigo": "POR-001",
            "estoque": 50,
            "empresa": "Choperia do Zé",
            "categoria": "COMIDA",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Tábua de Frios",
            "descricao": "Seleção de queijos e frios premium",
            "custo": Decimal('45.90'),
            "venda": Decimal('65.90'),
            "codigo": "TAB-001",
            "estoque": 30,
            "empresa": "Choperia do Zé",
            "categoria": "COMIDA",
            "imagem": "https://images.unsplash.com/photo-1625938144755-652e08e359b7",
            "is_available": True
        },
        {
            "nome": "Isca de Peixe",
            "descricao": "Iscas de peixe empanadas com molho tártaro",
            "custo": Decimal('30.90'),
            "venda": Decimal('45.90'),
            "codigo": "ISC-001",
            "estoque": 40,
            "empresa": "Choperia do Zé",
            "categoria": "COMIDA",
            "imagem": "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58",
            "is_available": True
        },
        {
            "nome": "Pastéis Mistos",
            "descricao": "Mix de pastéis com recheios variados (6 unidades)",
            "custo": Decimal('25.90'),
            "venda": Decimal('35.90'),
            "codigo": "PAS-001",
            "estoque": 45,
            "empresa": "Choperia do Zé",
            "categoria": "COMIDA",
            "imagem": "https://images.unsplash.com/photo-1625938144802-69竊4e359b7",
            "is_available": True
        },
        {
            "nome": "Tábua de Frios Premium",
            "descricao": "Seleção especial de queijos e frios importados",
            "custo": Decimal('65.90'),
            "venda": Decimal('89.90'),
            "codigo": "TAB-002",
            "estoque": 25,
            "empresa": "Choperia do Zé",
            "categoria": "COMIDA",
            "imagem": "https://images.unsplash.com/photo-1625938144755-652e08e359b7",
            "is_available": True
        },
        {
            "nome": "Nachos com Guacamole",
            "descricao": "Nachos crocantes com guacamole fresco",
            "custo": Decimal('22.90'),
            "venda": Decimal('32.90'),
            "codigo": "NAC-001",
            "estoque": 35,
            "empresa": "Choperia do Zé",
            "categoria": "COMIDA",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Bolinho de Bacalhau",
            "descricao": "Bolinhos de bacalhau tradicional português",
            "custo": Decimal('32.90'),
            "venda": Decimal('42.90'),
            "codigo": "BOL-001",
            "estoque": 40,
            "empresa": "Choperia do Zé",
            "categoria": "COMIDA",
            "imagem": "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58",
            "is_available": True
        },
        {
            "nome": "Anéis de Cebola",
            "descricao": "Anéis de cebola empanados e crocantes",
            "custo": Decimal('18.90'),
            "venda": Decimal('28.90'),
            "codigo": "ANE-001",
            "estoque": 45,
            "empresa": "Choperia do Zé",
            "categoria": "COMIDA",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Refrigerante Cola",
            "descricao": "Refrigerante tipo cola 350ml",
            "custo": Decimal('3.90'),
            "venda": Decimal('6.90'),
            "codigo": "BEB-001",
            "estoque": 200,
            "empresa": "Choperia do Zé",
            "categoria": "BEBIDA",
            "imagem": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
            "is_available": True
        },
        {
            "nome": "Água Mineral",
            "descricao": "Água mineral sem gás 500ml",
            "custo": Decimal('2.50'),
            "venda": Decimal('5.00'),
            "codigo": "BEB-002",
            "estoque": 250,
            "empresa": "Choperia do Zé",
            "categoria": "BEBIDA",
            "imagem": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
            "is_available": True
        },
        {
            "nome": "Suco de Laranja",
            "descricao": "Suco natural de laranja 400ml",
            "custo": Decimal('4.90'),
            "venda": Decimal('8.90'),
            "codigo": "SUC-001",
            "estoque": 100,
            "empresa": "Choperia do Zé",
            "categoria": "SUCO",
            "imagem": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
            "is_available": True
        },
        {
            "nome": "Tapioca de Queijo",
            "descricao": "Tapioca recheada com queijo coalho",
            "custo": Decimal('8.90'),
            "venda": Decimal('14.90'),
            "codigo": "TAP-001",
            "estoque": 60,
            "empresa": "Choperia do Zé",
            "categoria": "TAPIOCA",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Tapioca de Carne",
            "descricao": "Tapioca recheada com carne seca",
            "custo": Decimal('10.90'),
            "venda": Decimal('16.90'),
            "codigo": "TAP-002",
            "estoque": 55,
            "empresa": "Choperia do Zé",
            "categoria": "TAPIOCA",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Pizza Margherita",
            "descricao": "Pizza com molho de tomate, mussarela e manjericão",
            "custo": Decimal('25.90'),
            "venda": Decimal('39.90'),
            "codigo": "PIZ-001",
            "estoque": 40,
            "empresa": "Choperia do Zé",
            "categoria": "PIZZA",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Pizza Calabresa",
            "descricao": "Pizza com calabresa, cebola e mussarela",
            "custo": Decimal('27.90'),
            "venda": Decimal('42.90'),
            "codigo": "PIZ-002",
            "estoque": 35,
            "empresa": "Choperia do Zé",
            "categoria": "PIZZA",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Marmitex Executiva",
            "descricao": "Arroz, feijão, bife grelhado, salada e farofa",
            "custo": Decimal('15.90'),
            "venda": Decimal('25.90'),
            "codigo": "MAR-001",
            "estoque": 30,
            "empresa": "Choperia do Zé",
            "categoria": "MARMITEX",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Balde de Cerveja",
            "descricao": "Balde com 6 cervejas long neck",
            "custo": Decimal('45.90'),
            "venda": Decimal('69.90'),
            "codigo": "BAL-001",
            "estoque": 50,
            "empresa": "Choperia do Zé",
            "categoria": "BALDE",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Pudim de Leite",
            "descricao": "Pudim de leite condensado tradicional",
            "custo": Decimal('8.90'),
            "venda": Decimal('14.90'),
            "codigo": "SOB-001",
            "estoque": 25,
            "empresa": "Choperia do Zé",
            "categoria": "SOBREMESA",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Petit Gateau",
            "descricao": "Bolo de chocolate com recheio cremoso",
            "custo": Decimal('12.90'),
            "venda": Decimal('19.90'),
            "codigo": "SOB-002",
            "estoque": 20,
            "empresa": "Choperia do Zé",
            "categoria": "SOBREMESA",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Suco de Abacaxi",
            "descricao": "Suco natural de abacaxi 400ml",
            "custo": Decimal('4.90'),
            "venda": Decimal('8.90'),
            "codigo": "SUC-002",
            "estoque": 90,
            "empresa": "Choperia do Zé",
            "categoria": "SUCO",
            "imagem": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
            "is_available": True
        },
        {
            "nome": "Suco de Maracujá",
            "descricao": "Suco natural de maracujá 400ml",
            "custo": Decimal('4.90'),
            "venda": Decimal('8.90'),
            "codigo": "SUC-003",
            "estoque": 85,
            "empresa": "Choperia do Zé",
            "categoria": "SUCO",
            "imagem": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
            "is_available": True
        },
        {
            "nome": "X-Tudo",
            "descricao": "Hambúrguer completo com tudo que tem direito",
            "custo": Decimal('18.90'),
            "venda": Decimal('28.90'),
            "codigo": "LAN-001",
            "estoque": 40,
            "empresa": "Choperia do Zé",
            "categoria": "LANCHE",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Hot Dog Especial",
            "descricao": "Cachorro quente com molhos especiais",
            "custo": Decimal('12.90'),
            "venda": Decimal('19.90'),
            "codigo": "LAN-002",
            "estoque": 45,
            "empresa": "Choperia do Zé",
            "categoria": "LANCHE",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Misto Quente",
            "descricao": "Sanduíche de queijo e presunto na chapa",
            "custo": Decimal('8.90'),
            "venda": Decimal('14.90'),
            "codigo": "LAN-003",
            "estoque": 50,
            "empresa": "Choperia do Zé",
            "categoria": "LANCHE",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Cerveja Long Neck",
            "descricao": "Cerveja importada long neck 355ml",
            "custo": Decimal('8.90'),
            "venda": Decimal('12.90'),
            "codigo": "CER-001",
            "estoque": 150,
            "empresa": "Choperia do Zé",
            "categoria": "CERVEJA",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        },
        {
            "nome": "Porção de Calabresa",
            "descricao": "Calabresa acebolada na chapa",
            "custo": Decimal('22.90'),
            "venda": Decimal('32.90'),
            "codigo": "POR-002",
            "estoque": 40,
            "empresa": "Choperia do Zé",
            "categoria": "COMIDA",
            "imagem": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877",
            "is_available": True
        }
    ]

    # Itera sobre os dados e adiciona ao banco de dados
    for produto_data in produtos:
        try:
            categoria_obj = Categoria.objects.get(nome=produto_data["categoria"])
            empresa_obj = Empresa.objects.get(nome=produto_data["empresa"])

            produto, created = Produto.objects.update_or_create(
                codigo=produto_data["codigo"],
                defaults={
                    "nome": produto_data["nome"],
                    "descricao": produto_data["descricao"],
                    "custo": produto_data["custo"],
                    "venda": produto_data["venda"],
                    "estoque": produto_data["estoque"],
                    "empresa": empresa_obj,
                    "categoria": categoria_obj,
                    "imagem": produto_data["imagem"],
                    "is_available": produto_data["is_available"],
                },
            )

            if created:
                print(f"Produto criado: {produto.nome}")
                if not Estoque.objects.filter(empresa=empresa_obj, produto=produto).exists():
                    Estoque.objects.create(
                        empresa=empresa_obj,
                        produto=produto,
                        quantidade=produto.estoque,
                        tipo='entrada',
                    )
            else:
                print(f"Produto atualizado: {produto.nome}")

        except Categoria.DoesNotExist:
            print(f"❌ ERRO: Categoria '{produto_data['categoria']}' não encontrada!")
        except Empresa.DoesNotExist:
            print(f"❌ ERRO: Empresa '{produto_data['empresa']}' não encontrada!")

def populate_mesas():
    """Cria mesas no banco de dados se elas não existirem."""
    empresa = Empresa.objects.first()
    print(f"Empresa padrão: {empresa.nome}")
    if empresa:
        for i in range(1, 11):
            numero = str(i).zfill(2)
            nome = f"Mesa {numero}"
            Mesa.objects.get_or_create(
                empresa=empresa,
                numero=numero,
                defaults={
                    "nome": nome,
                    "status": "Livre",
                    "pedido": 0,
                    "valor_pago": Decimal('0.00'),
                    "pessoas_pagaram": 0,
                    "numero_pessoas": 1,
                    "is_available": True,
                }
            )
            print(f"Mesa {numero} criada para a empresa {empresa.nome}")

if __name__ == "__main__":
    print("Populando Categorias...")
    populate_categorias()
    
    print("Populando Empresas...")
    populate_empresas()
    
    print("Populando Produtos...")
    populate_produtos()
    
    print("Populando Mesas...")
    populate_mesas()
    
    print("População do banco de dados concluída!")



