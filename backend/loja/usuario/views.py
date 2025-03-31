from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from rest_framework import status
from .models import Usuario
from .serializers import UsuarioSerializer
from django.db.models import Q
from django.contrib.auth import authenticate, login

@api_view(['POST'])
def user_login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, username=email, password=password)  # Usa email como username
    if user is not None:
        login(request, user)
        usuario = Usuario.objects.get(user=user)
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def search_usuarios(request):
    query = request.query_params.get("search", "")
    usuarios = Usuario.objects.filter(
        Q(user__first_name__icontains=query) | 
        Q(user__last_name__icontains=query) |
        Q(user__email__icontains=query)
    )
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])  # Exige autenticação
def usuarios(request):
    if request.method == 'GET':
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')
        user_type = request.data.get('user_type', 'online')

        if not all([name, email, password]):
            return Response({'error': 'Todos os campos (name, email, password) são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if User.objects.filter(username=email).exists():
                return Response({'error': 'Este email já está registrado'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create_user(username=email, email=email, password=password)
            user.first_name = name.split(' ')[0]
            user.save()

            usuario_data = {
                'user': user.id,
                'name': name,
                'email': email,
                'user_type': user_type,
            }
            serializer = UsuarioSerializer(data=usuario_data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response({'error': 'Erro ao salvar Usuario', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f"Erro ao criar User: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def usuario_detail(request, slug):
    try:
        usuario = Usuario.objects.get(slug=slug)
    except Usuario.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UsuarioSerializer(usuario, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        usuario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    usuario = Usuario.objects.get(user=request.user)
    serializer = UsuarioSerializer(usuario)
    return Response({'user': serializer.data}, status=status.HTTP_200_OK)

