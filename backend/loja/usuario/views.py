# backend/loja/usuario/views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Usuario, UserToken
from .serializers import UsuarioSerializer
from django.db.models import Q
from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
import uuid

@api_view(['POST'])
def user_login(request):
    print("Login request data em user_login:", request.data)  # Debugging line
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
@permission_classes([AllowAny]) # Permitir acesso não autenticado
def usuarios(request):
    if request.method == 'GET':
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        # Lógica existente para criar um usuário
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')
        user_type = request.data.get('user_type', 'online')

        print("Dados recebidos:", name, email, password, user_type)

        if not all([name, email, password]):
            return Response({'error': 'Todos os campos (name, email, password) são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            print("O usuario existe?", User.objects.filter(username=email).exists())          
            print("O email existe?", User.objects.filter(email=email).exists())
            print("O password?", User.objects.filter(password=password).exists())
            if User.objects.filter(username=email).exists():
                return Response({'error': 'Este email já está registrado'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create_user(username=email, email=email, password=password)
            user.first_name = name.split(' ')[0]
            user.save()

        except Exception as e:
            return Response({'error': f"Erro ao criar User: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

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
        else:
            return Response({'error': 'Erro ao salvar Usuario', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
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

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    print("Estou em Login")
    email = request.data.get('email')
    password = request.data.get('password')
    print("Login request data:", request.data)
    print("Email:", email)
    print("Password:", password)
    user = authenticate(request, username=email, password=password)
    print("User autenticado:", user)
    
    if user is not None:
        # Gerar o token JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Salvar o token no banco
        user_token, created = UserToken.objects.update_or_create(
            user=user,
            defaults={'access_token': access_token, 'refresh_token': refresh_token}
        )
        
        # Serializar o usuário
        usuario = Usuario.objects.get(user=user)
        serializer = UsuarioSerializer(usuario)
        print("Tipo de usuário retornado:", serializer.data.get('user_type'))
        
        # Gerar um session ID único
        session_id = str(uuid.uuid4())
        
        # Configurar cookie HTTP-only com o session ID
        response = Response({
            'user': serializer.data,
            'session_id': session_id  # Retornado apenas para depuração, pode ser removido
        }, status=status.HTTP_200_OK)
        response.set_cookie(
            key='session_id',
            value=session_id,
            httponly=True,  # Protege contra XSS
            secure=False,   # Use True em produção com HTTPS
            samesite='Lax'  # Protege contra CSRF
        )
        
        return response
    
    return Response({"detail": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_token(request):
    session_id = request.COOKIES.get('session_id')
    if not session_id:
        return Response({"detail": "Sessão não encontrada"}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Aqui você pode adicionar uma lógica para associar session_id a um usuário no backend
        # Por simplicidade, vamos assumir que o usuário está autenticado via Django session
        if request.user.is_authenticated:
            user_token = UserToken.objects.get(user=request.user)
            usuario = Usuario.objects.get(user=request.user)
            serializer = UsuarioSerializer(usuario)
            return Response({
                'user': serializer.data,
                'access_token': user_token.access_token
            }, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Usuário não autenticado"}, status=status.HTTP_401_UNAUTHORIZED)
    except UserToken.DoesNotExist:
        return Response({"detail": "Token não encontrado"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    session_id = request.COOKIES.get('session_id') # Obter o session_id do cookie
    if session_id and request.user.is_authenticated:
        UserToken.objects.filter(user=request.user).delete()
        response = Response({"detail": "Logout bem-sucedido"}, status=status.HTTP_200_OK)
        response.delete_cookie('session_id')
        return response
    return Response({"detail": "Nenhuma sessão ativa"}, status=status.HTTP_400_BAD_REQUEST)





