from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Favorito
from .serializers import FavoritoSerializer
from produto.models import Produto
from django.contrib.auth.models import User

@api_view(['GET'])
@permission_classes([AllowAny])
def listar_favoritos(request):
    user_id = request.GET.get('user_id')
    if not user_id or user_id == 'undefined':  # Explicitly check for 'undefined'
        return Response({'error': 'user_id é obrigatório ou inválido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        usuario = User.objects.get(id=user_id)
        favoritos = Favorito.objects.filter(usuario=usuario)
        serializer = FavoritoSerializer(favoritos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError:  # Handle invalid user_id (e.g., non-integer)
        return Response({'error': 'user_id inválido'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@api_view(['POST'])
@permission_classes([AllowAny])  # Sem autenticação
def adicionar_favorito(request):
    print('Dados:', request.data)
    produto_id = request.data.get('produto_id')
    user_id = request.data.get('user_id')  # Pegar o user_id do corpo da requisição
    
    if not user_id or not produto_id:
        return Response({'error': 'user_id e produto_id são obrigatórios'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        usuario = User.objects.get(id=user_id)
        produto = Produto.objects.get(id=produto_id)
        favorito, created = Favorito.objects.get_or_create(usuario=usuario, produto=produto)
        if created:
            serializer = FavoritoSerializer(favorito)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'message': 'Produto já está nos favoritos'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Produto.DoesNotExist:
        return Response({'error': 'Produto não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])  # Sem autenticação
def remover_favorito(request, produto_id):
    user_id = request.data.get('user_id')  # Pegar o user_id do corpo da requisição
    
    if not user_id:
        return Response({'error': 'user_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        usuario = User.objects.get(id=user_id)
        favorito = Favorito.objects.get(usuario=usuario, produto__id=produto_id)
        favorito.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Favorito.DoesNotExist:
        return Response({'error': 'Favorito não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)