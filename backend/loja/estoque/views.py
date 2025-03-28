# backend/loja/estoque/views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Estoque
from .serializers import EstoqueSerializer
from django.db.models import Q

@api_view(['GET'])
def search_estoques(request):
    query = request.query_params.get("search")
    estoques = Estoque.objects.filter(
        Q(nome__icontains=query)
    )
    serializer = EstoqueSerializer(estoques, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# backend/loja/estoque/views.py
@api_view(['GET', 'POST'])
def estoques(request):
    if request.method == 'GET':
        estoques = Estoque.objects.all()
        serializer = EstoqueSerializer(estoques, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST': # Adicionar POST para criar uma nova movimentação de entrada ou saída de estoque
        print(f'🚀 Recebendo requisição POST para /estoques/: {request.data}')
        if isinstance(request.data, list):
            responses = []
            for item in request.data:
                serializer = EstoqueSerializer(data=item)
                if serializer.is_valid():
                    serializer.save()
                    responses.append(serializer.data)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(responses, status=status.HTTP_201_CREATED)
        else:
            serializer = EstoqueSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def estoque_detail(request, slug):
    try:
        estoque = Estoque.objects.get(slug=slug)
    except Estoque.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = EstoqueSerializer(estoque)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = EstoqueSerializer(estoque, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        estoque.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    




