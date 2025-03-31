
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("usuarios/", views.usuarios, name="usuarios"),
    path("usuarios/<slug:slug>/", views.usuario_detail, name="usuario-detail"),
    path("usuarios-search/", views.search_usuarios, name='usuarios-search'),  
    path('get-user/', views.get_user, name='get_user'),  
    # Django cuida do resto não é necessário views para token token-refresh
    # TokenObtainPairView e TokenRefreshView são views do djangorestframework_simplejwt
    # que fornecem os tokens JWT para autenticação
    path("api/token/", TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Obter access e refresh tokens login do usuario
    path("api/token/refresh/", TokenRefreshView.as_view(), name='token_refresh'),  # Atualizar token de acesso 
]

