# backend\loja\favoritos\views.py
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Favorito
from .serializers import FavoritoSerializer
from produto.models import Produto

@api_view(['GET'])
@permission_classes([AllowAny])  # Permite acesso a qualquer usuário
def listar_favoritos(request):
    print('Usuario:', request.user)
    print('Autenticado:', request.user.is_authenticated)
    if request.user.is_authenticated:
        # Usuário autenticado: retorna os favoritos do usuário
        favoritos = Favorito.objects.filter(usuario=request.user)
        serializer = FavoritoSerializer(favoritos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        # Usuário não autenticado: retorna uma lista vazia
        return Response([], status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny]) # Permite apenas usuários autenticados
def adicionar_favorito(request):
    print('Usuario:', request.user)
    print('Dados:', request.data)
    print('Autenticado:', request.user.is_authenticated)
    produto_id = request.data.get('produto_id')
    if not request.user.is_authenticated:
        return Response({'error': 'Usuário não autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        produto = Produto.objects.get(id=produto_id)
        favorito, created = Favorito.objects.get_or_create(usuario=request.user, produto=produto)
        if created:
            serializer = FavoritoSerializer(favorito)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'message': 'Produto já está nos favoritos'}, status=status.HTTP_200_OK)
    except Produto.DoesNotExist:
        return Response({'error': 'Produto não encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def remover_favorito(request, produto_id):
    print('Usuario:', request.user)
    print('Autenticado:', request.user.is_authenticated)
    if not request.user.is_authenticated:
        return Response({'error': 'Usuário não autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        favorito = Favorito.objects.get(usuario=request.user, produto__id=produto_id)
        favorito.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Favorito.DoesNotExist:
        return Response({'error': 'Favorito não encontrado'}, status=status.HTTP_404_NOT_FOUND)

        