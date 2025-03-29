
# backend/loja/pedido/views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Pedido, ItemPedido
from .serializers import PedidoSerializer, ItemPedidoSerializer
from carrinho.models import Carrinho, ItemCarrinho
from produto.models import Produto
from empresa.models import Empresa
from django.contrib.auth.models import User
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
def search_pedidos(request):
    query = request.query_params.get("search", "")
    logger.info(f"Query recebida: {query}")
    pedidos = Pedido.objects.filter(
        Q(itens__produto__nome__icontains=query) | # busca pelo nome do produto nos itens do pedido
        Q(usuario__username__icontains=query) | # busca pelo nome de usuário
        Q(status__icontains=query) | # busca pelo status do pedido
        Q(origem__icontains=query) # busca pela origem do pedido
    )
    logger.info(f"Pedidos encontrados: {pedidos.count()}")
    serializer = PedidoSerializer(pedidos, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
       
@api_view(['GET', 'POST'])
def pedidos(request):
    if request.method == 'GET':
        pedidos = Pedido.objects.all()
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PedidoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def pedido_detail(request, slug):
    try:
        pedido = Pedido.objects.get(slug=slug)
    except Pedido.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PedidoSerializer(pedido)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = PedidoSerializer(pedido, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        pedido.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def criar_pedido(request):
    usuario = request.user
    carrinho_slug = request.data.get('carrinho_slug')
    metodo_pagamento = request.data.get('metodo_pagamento')

    try:
        carrinho = Carrinho.objects.get(slug=carrinho_slug)
    except Carrinho.DoesNotExist:
        return Response({'error': 'Carrinho não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    subtotal = sum(item.quantidade * item.preco_unitario for item in carrinho.itens.all())
    total = max(0, subtotal) 

    pedido = Pedido(
        usuario=usuario,
        carrinho=carrinho,
        total=total,
        metodo_pagamento=metodo_pagamento,
        origem='online'
    )
    pedido.save()

    serializer = PedidoSerializer(pedido)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])  # Temporarily allow any user to access this endpoint
def historico_pedidos(request):
    print("Acessando historico_pedidos")  # Log para depuração
    pedidos = Pedido.objects.filter(usuario=request.user).order_by('-data')
    serializer = PedidoSerializer(pedidos, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
def atualizar_status(request, slug):
    try:
        pedido = Pedido.objects.get(slug=slug)
        status_novo = request.data.get('status')
        if status_novo in dict(Pedido._meta.get_field('status').choices):
            pedido.status = status_novo
            pedido.save()
            serializer = PedidoSerializer(pedido)
            return Response(serializer.data)
        return Response({'error': 'Status inválido'}, status=status.HTTP_400_BAD_REQUEST)
    except Pedido.DoesNotExist:
        return Response({'error': 'Pedido não encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def confirmar_recebimento(request, slug):
    try:
        pedido = Pedido.objects.get(slug=slug, usuario=request.user)
        if pedido.status == 'em-andamento':
            pedido.status = 'entregue'
            pedido.save()
            serializer = PedidoSerializer(pedido)
            return Response(serializer.data)
        return Response({'error': 'Pedido não pode ser confirmado'}, status=status.HTTP_400_BAD_REQUEST)
    except Pedido.DoesNotExist:
        return Response({'error': 'Pedido não encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anonymous access for cart orders
def criar_pedido_from_carrinho(request, carrinhoSlug):
    try:
        carrinho = Carrinho.objects.get(slug=carrinhoSlug)
    except Carrinho.DoesNotExist:
        return Response({"error": "Carrinho não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    # Get authenticated user if available, but allow anonymous orders
    usuario = request.user if request.user.is_authenticated else None

    data = request.data
    metodo_pagamento = data.get('metodo_pagamento')
    empresa_id = data.get('empresa_id')
    desconto_aplicado = data.get('desconto_aplicado', 0)

    try:
        empresa = Empresa.objects.get(id=empresa_id)
    except Empresa.DoesNotExist:
        return Response({"error": "Empresa não encontrada"}, status=status.HTTP_404_NOT_FOUND)

    itens_carrinho = ItemCarrinho.objects.filter(carrinho=carrinho)
    if not itens_carrinho.exists():
        return Response({"error": "Carrinho vazio"}, status=status.HTTP_400_BAD_REQUEST)

    # Create the pedido
    pedido = Pedido(
        usuario=usuario,
        empresa=empresa,
        total=0,
        metodo_pagamento=metodo_pagamento,
        origem='online',
        carrinho=carrinho,
        desconto_aplicado=desconto_aplicado if desconto_aplicado else 0,
    )
    
    pedido.save()

    total = 0
    for item in itens_carrinho:
        item_pedido = ItemPedido(
            pedido=pedido,
            produto=item.produto,
            quantidade=item.quantidade,
            preco_unitario=item.preco_unitario,
            total=item.quantidade * item.preco_unitario,
        )
        item_pedido.save()
        total += item_pedido.total

    pedido.total = total - (desconto_aplicado or 0)
    pedido.save()

    # Clear the cart items
    carrinho.itens.all().delete()

    serializer = PedidoSerializer(pedido)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
