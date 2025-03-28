# filepath: /d:/Meta-AI/notafiscal-tracker-notas/backend/loja/notafiscal/views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import NotaFiscal
from .serializers import NotaFiscalSerializer
from django.db.models import Q

@api_view(['GET'])
def search_notasfiscais(request):
    query = request.query_params.get("search")
    notasfiscais = NotaFiscal.objects.filter(
        Q(nome__icontains=query)
    )
    serializer = NotaFiscalSerializer(notasfiscais, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
def notasfiscais(request):
    if request.method == 'GET':
        notasfiscais = NotaFiscal.objects.all()
        serializer = NotaFiscalSerializer(notasfiscais, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = NotaFiscalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def notafiscal_detail(request, slug):
    try:
        notafiscal = NotaFiscal.objects.get(slug=slug)
    except NotaFiscal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = NotaFiscalSerializer(notafiscal)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = NotaFiscalSerializer(notafiscal, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        notafiscal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    






