# backend\loja\carrinho\views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .models import Carrinho, ItemCarrinho, Produto
from .serializers import CarrinhoSerializer, ItemCarrinhoSerializer
from django.db.models import Q
from django.utils.text import slugify
import uuid

@api_view(['GET'])
def search_carrinhos(request):
    """Busca carrinhos por slug, sessão ou nome de usuário."""
    query = request.query_params.get("search", "")
    carrinhos = Carrinho.objects.filter(
        Q(slug__icontains=query) | Q(sessao_id__icontains=query) | Q(usuario__username__icontains=query)
    )
    serializer = CarrinhoSerializer(carrinhos, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
def carrinhos(request):
    """Lista todos os carrinhos do usuário/sessão ou cria um novo."""
    usuario = request.user if request.user.is_authenticated else None
    sessao_id = request.session.session_key if not usuario else None

    if request.method == 'GET':
        carrinhos = Carrinho.objects.filter(usuario=usuario, sessao_id=sessao_id)
        serializer = CarrinhoSerializer(carrinhos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Cria um novo carrinho com slug único
        data = request.data.copy()
        data['usuario'] = usuario.id if usuario else None
        data['sessao_id'] = sessao_id
        data['slug'] = slugify(f"carrinho-{uuid.uuid4().hex[:8]}")  # Gera slug único
        serializer = CarrinhoSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def carrinho_detail(request, slug):
    """Detalha, atualiza ou deleta um carrinho específico por slug."""
    try:
        carrinho = Carrinho.objects.get(slug=slug)
    except Carrinho.DoesNotExist:
        return Response({"error": "Carrinho não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CarrinhoSerializer(carrinho)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = CarrinhoSerializer(carrinho, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        carrinho.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def adicionar_item_carrinho(request, slug):
    """Adiciona um item ao carrinho e atualiza o estoque."""
    print(f'🚀 Tentando adicionar item ao carrinho com slug: {slug}')
    try:
        # Tenta encontrar o carrinho pelo slug
        carrinho = Carrinho.objects.get(slug=slug)
        print(f'✅ Carrinho encontrado: {carrinho.slug}')
    except Carrinho.DoesNotExist:
        print(f'❌ Carrinho com slug {slug} não encontrado!')
        return Response({"error": "Carrinho não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    print(f'📌 Dados recebidos: {request.data}')
    # Obtém o ID do produto e a quantidade do item a ser adicionado
    produto_id = request.data.get('produto_id')
    if not produto_id:
        print(f'❌ Nenhum produto_id fornecido na requisição!')
        return Response({"error": "produto_id é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Ajuste para garantir que a quantidade seja um número inteiro positivo e que seja 1 unidade por padrão
    quantidade = int(request.data.get('quantidade', 1))
    if quantidade <= 0:
        print(f'❌ Quantidade inválida: {quantidade}')
        return Response({"error": "Quantidade deve ser maior que zero"}, status=status.HTTP_400_BAD_REQUEST)

    # Opcional: Obter o ID da empresa para produtos com estoque separado
    empresa_id = request.data.get('empresa_id', None)

    # Obter o slug do produto para preservar o slug original
    produto_slug = request.data.get('slug')  # Corrigido: usar request.data em vez de data

    try:
        produto = Produto.objects.get(id=produto_id)
        print(f'✅ Produto encontrado: {produto.nome}')
    except Produto.DoesNotExist:
        print(f'❌ Produto com ID {produto_id} não encontrado!')
        return Response({"error": "Produto não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    if produto.estoque < quantidade:
        print(f'❌ Estoque insuficiente para {produto.nome}: {produto.estoque} disponíveis')
        return Response({"error": "Estoque insuficiente"}, status=status.HTTP_400_BAD_REQUEST)

    """Adiciona ou atualiza um item no carrinho."""
    item, created = ItemCarrinho.objects.get_or_create(
        carrinho=carrinho,
        produto=produto,
        empresa_id=empresa_id,
        defaults={
            'quantidade': quantidade,
            'preco_unitario': produto.venda or produto.custo,
            'slug': slugify(f"item-{produto.nome}-{uuid.uuid4().hex[:8]}"),  # Gera slug único para o ItemCarrinho
            'produto_slug': produto_slug or produto.slug,  # Preservar o slug do produto
        }
    )

    # Atualiza a quantidade se o item já existir
    if not created:
        item.quantidade += quantidade
        item.save()
        print(f'✅ Quantidade do item {produto.nome} atualizada: {item.quantidade}')
    else:
        print(f'✅ Novo item {produto.nome} adicionado ao carrinho com slug: {item.slug}')

    produto.estoque -= quantidade
    produto.save()
    print(f'✅ Estoque atualizado: {produto.estoque}')

    serializer = CarrinhoSerializer(carrinho)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
def atualizar_item_carrinho(request, slug):
    try:
        carrinho = Carrinho.objects.get(slug=slug)
    except Carrinho.DoesNotExist:
        return Response({"error": "Carrinho não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    item_slug = request.data.get('item_slug')
    quantidade = int(request.data.get('quantidade', 1))

    try:
        item = ItemCarrinho.objects.get(slug=item_slug, carrinho=carrinho)
        if quantidade <= 0:
            item.delete()
        else:
            diferenca = quantidade - item.quantidade
            item.quantidade = quantidade
            item.produto.estoque -= diferenca
            item.produto.save()
            item.save()
        serializer = CarrinhoSerializer(carrinho)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except ItemCarrinho.DoesNotExist:
        return Response({"error": "Item não encontrado"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def remover_item_carrinho(request, slug):
    """Remove um item do carrinho por produto_slug e restaura o estoque."""
    print(f'🚀 Tentando remover item do carrinho com slug: {slug}')
    try:
        carrinho = Carrinho.objects.get(slug=slug)
        print(f'✅ Carrinho encontrado: {carrinho.slug}')
    except Carrinho.DoesNotExist:
        print(f'❌ Carrinho com slug {slug} não encontrado!')
        return Response({"error": "Carrinho não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    produto_slug = request.data.get('item_slug')  # Renomeie para clareza, mas mantenha compatibilidade
    if not produto_slug:
        print('❌ Produto slug não fornecido!')
        return Response({"error": "item_slug é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Busca o item pelo produto_slug em vez do slug do ItemCarrinho
        item = ItemCarrinho.objects.get(produto_slug=produto_slug, carrinho=carrinho)
        produto = item.produto
        print(f'✅ Item encontrado: {produto.nome}, quantidade: {item.quantidade}, produto_slug: {item.produto_slug}')
    except ItemCarrinho.DoesNotExist:
        print(f'❌ Item com produto_slug {produto_slug} não encontrado no carrinho {carrinho.slug}!')
        return Response({"error": "Item não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    quantidade = item.quantidade
    item.delete()
    produto.estoque += quantidade
    produto.save()
    print(f'✅ Item removido do carrinho {carrinho.slug}, estoque atualizado: {produto.estoque}')

    serializer = CarrinhoSerializer(carrinho)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
@api_view(['POST'])
def cancelar_pedido(request, slug):
    """Cancela o pedido do carrinho, removendo todos os itens e restaurando o estoque."""
    print(f'🚀 Tentando cancelar pedido do carrinho com slug: {slug}')
    try:
        carrinho = Carrinho.objects.get(slug=slug)
        print(f'✅ Carrinho encontrado: {carrinho.slug}')
    except Carrinho.DoesNotExist:
        print(f'❌ Carrinho com slug {slug} não encontrado!')
        return Response({"error": "Carrinho não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    # Remove todos os itens e restaura o estoque
    for item in carrinho.itens.all():
        produto = item.produto
        produto.estoque += item.quantidade
        produto.save()
        print(f'✅ Estoque restaurado para {produto.nome}: {produto.estoque}')
    carrinho.itens.all().delete()
    print(f'✅ Todos os itens do carrinho {carrinho.slug} removidos')

    return Response({"message": "Carrinho cancelado com sucesso"}, status=status.HTTP_200_OK)
    