# backend\loja\produto\views.py
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.db.models import Q
from .models import Produto
from .serializers import ProdutoSerializer

@api_view(['GET'])
def search_produtos(request):
    query = request.query_params.get("search", "")

    produtos = Produto.objects.filter(
        Q(nome__icontains=query) | 
        Q(codigo__icontains=query) | 
        Q(venda__icontains=query) |
        Q(descricao__icontains=query) |
        Q(categoria__nome__icontains=query)  # ✅ Busca pelo nome da categoria
    )
    
    serializer = ProdutoSerializer(produtos, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
def produtos(request):
    if request.method == "GET":
        produtos = Produto.objects.all()
        serializer = ProdutoSerializer(produtos, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ProdutoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def produto_detail(request, slug):
    try:
        produto = Produto.objects.get(slug=slug)
    except Produto.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProdutoSerializer(produto)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ProdutoSerializer(produto, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        produto.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def produto_por_id(request, id):
    print('Chamei produto_por_id na views produto:', id)
    try:
        produto = Produto.objects.get(id=id)
        serializer = ProdutoSerializer(produto)
        return Response(serializer.data)
    except Produto.DoesNotExist:
        return Response({'status': 'error', 'message': 'Produto não encontrado'}, status=404)
    
@api_view(['POST'])
def decrementar_estoque(request, slug):
    try:
        produto = Produto.objects.get(slug=slug)
        quantidade = request.data.get('quantidade', 0)
        produto.estoque = max(0, produto.estoque - quantidade)
        produto.save()
        return Response({'status': 'success', 'estoque': produto.estoque})
    except Produto.DoesNotExist:
        return Response({'status': 'error', 'message': 'Produto não encontrado'}, status=404)

@api_view(['POST'])
def incrementar_estoque(request, slug):
    try:
        produto = Produto.objects.get(slug=slug)
        quantidade = request.data.get('quantidade', 0)
        produto.estoque += quantidade
        produto.save()
        return Response({'status': 'success', 'estoque': produto.estoque})
    except Produto.DoesNotExist:
        return Response({'status': 'error', 'message': 'Produto não encontrado'}, status=404)
    


