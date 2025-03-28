# backend\loja\cupom\views.py
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Cupom
from .serializers import CupomSerializer
from datetime import datetime

@api_view(['GET'])
def listar_cupons(request):
    cupons = Cupom.objects.filter(ativo=True, valido_ate__gte=datetime.now())
    serializer = CupomSerializer(cupons, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def aplicar_cupom(request):
    codigo = request.data.get('codigo')
    try:
        cupom = Cupom.objects.get(codigo=codigo, ativo=True, valido_ate__gte=datetime.now())
        serializer = CupomSerializer(cupom)
        return Response(serializer.data)
    except Cupom.DoesNotExist:
        return Response({'error': 'Cupom inválido ou expirado'}, status=status.HTTP_404_NOT_FOUND)
