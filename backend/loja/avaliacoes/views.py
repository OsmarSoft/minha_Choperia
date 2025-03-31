# backend\loja\avaliacoes\views.py
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Avaliacao
from .serializers import AvaliacaoSerializer
from produto.models import Produto
from django.db.models import Avg
from django.contrib.auth.models import User

@api_view(['GET'])
@permission_classes([AllowAny])
def listar_avaliacoes_usuario(request):
    user_id = request.GET.get('user_id')
    if not user_id:
        return Response({'error': 'user_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        usuario = User.objects.get(id=user_id)
        avaliacoes = Avaliacao.objects.filter(usuario=usuario)
        serializer = AvaliacaoSerializer(avaliacoes, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def listar_avaliacoes_produto(request, produto_id):
    avaliacoes = Avaliacao.objects.filter(produto__id=produto_id)
    serializer = AvaliacaoSerializer(avaliacoes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def criar_avaliacao(request):
    produto_id = request.data.get('produto_id')
    user_id = request.data.get('user_id')
    rating = request.data.get('nota')  # Match frontend 'nota'
    comentario = request.data.get('comentario')

    if not all([produto_id, user_id, rating]):
        return Response({'error': 'produto_id, user_id e nota são obrigatórios'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        produto = Produto.objects.get(id=produto_id)
        usuario = User.objects.get(id=user_id)
        avaliacao, created = Avaliacao.objects.update_or_create(
            usuario=usuario, produto=produto,
            defaults={'rating': rating, 'comentario': comentario}
        )
        serializer = AvaliacaoSerializer(avaliacao)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    except Produto.DoesNotExist:
        return Response({'error': 'Produto não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([AllowAny])
def editar_avaliacao(request, slug):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        usuario = User.objects.get(id=user_id)
        avaliacao = Avaliacao.objects.get(slug=slug, usuario=usuario)
        rating = request.data.get('rating', avaliacao.rating)
        comentario = request.data.get('comentario', avaliacao.comentario)
        avaliacao.rating = rating
        avaliacao.comentario = comentario
        avaliacao.save()
        serializer = AvaliacaoSerializer(avaliacao)
        return Response(serializer.data)
    except Avaliacao.DoesNotExist:
        return Response({'error': 'Avaliação não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def remover_avaliacao(request, slug):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        usuario = User.objects.get(id=user_id)
        avaliacao = Avaliacao.objects.get(slug=slug, usuario=usuario)
        avaliacao.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Avaliacao.DoesNotExist:  # Fixed 'campi except' to 'except'
        return Response({'error': 'Avaliação não encontrada'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def media_avaliacoes(request, produto_id):
    try:
        media = Avaliacao.objects.filter(produto__id=produto_id).aggregate(Avg('rating'))['rating__avg'] or 0
        return Response({'produto_id': produto_id, 'media': round(media, 2)})
    except Produto.DoesNotExist:
        return Response({'error': 'Produto não encontrado'}, status=status.HTTP_404_NOT_FOUND)

