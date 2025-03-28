# backend/loja/loja/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('produto.urls')),  # Add the new app URLs
    path('api/', include('categoria.urls')),
    path('api/', include('empresa.urls')),  
    path('api/', include('notafiscal.urls')),
    path('api/', include('mesa.urls')),
    path('api/', include('pedido.urls')),
    path('api/', include('estoque.urls')),
    path('api/', include('usuario.urls')),      # App existente ainda não usado
    path('api/', include('carrinho.urls')),    # Novos apps
    path('api/', include('cupom.urls')),
    path('api/', include('favoritos.urls')),
    path('api/', include('avaliacoes.urls')),
]



