# backend/loja/mesa/views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Mesa, Empresa, ItemMesa, Produto
from .serializers import MesaSerializer, ItemMesaSerializer
from django.db.models import Q

@api_view(['GET'])
def search_mesas(request):
    query = request.query_params.get("search")
    mesas = Mesa.objects.filter(
        Q(nome__icontains=query)
    )
    serializer = MesaSerializer(mesas, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', 'POST']) # Adicionar POST para criar uma nova mesa 
def mesas(request): # Adicionar request como argumento da função 
    if request.method == 'GET': # Adicionar um bloco de código para o método GET 
        mesas = Mesa.objects.all() # Adicionar uma variável mesas para armazenar todas as mesas
        serializer = MesaSerializer(mesas, many=True) 
        return Response(serializer.data)
    
    elif request.method == 'POST':
        empresa_id = request.data.get('empresa')

        if not empresa_id:
            empresa = Empresa.objects.first()  # Busca a primeira empresa se não for enviada
        else:
            try:
                empresa = Empresa.objects.get(id=empresa_id)
            except Empresa.DoesNotExist:
                return Response({"error": "Empresa não encontrada"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = MesaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(empresa=empresa)  # Garante que a empresa seja associada
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            """# Adicionar a empresa ao serializer, pois ela não é enviada no POST request, ou seja, o frontend não a enviou 
            # Se a empresa não for enviada, a primeira empresa será selecionada
            empresa = Empresa.objects.first()  # Buscar a primeira empresa
            serializer.save(empresa=empresa)  # Adicionar a empresa ao serializer
            # Se o campo empresa fosse enviado no POST request, a linha acima seria: serializer.save() somente e não seria necessário buscar a empresa
            return Response(serializer.data, status=status.HTTP_201_CREATED)"""
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def mesa_detail(request, slug):
    try:
        mesa = Mesa.objects.get(slug=slug)
    except Mesa.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = MesaSerializer(mesa)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = MesaSerializer(mesa, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        mesa.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

@api_view(['POST'])
def adicionar_item_mesa(request, slug):
    print(f'🚀 Tentando adicionar item à mesa com slug: {slug}')
    try:
        mesa = Mesa.objects.get(slug=slug)
        print(f'✅ Mesa encontrada: {mesa.nome}')
    except Mesa.DoesNotExist:
        print(f'❌ Mesa com slug {slug} não encontrada!')
        return Response({"error": "Mesa não encontrada"}, status=status.HTTP_404_NOT_FOUND)

    # Logar o request.data para depuração
    print(f'📌 Dados recebidos: {request.data}')

    produto_id = request.data.get('produto_id')
    if produto_id is None:
        print(f'❌ Nenhum produto_id fornecido na requisição!')
        return Response({"error": "produto_id é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

    quantidade = int(request.data.get('quantidade', 1))  # Garantir que seja inteiro
    try:
        produto = Produto.objects.get(id=produto_id)
        print(f'✅ Produto encontrado: {produto.nome}')
    except Produto.DoesNotExist:
        print(f'❌ Produto com ID {produto_id} não encontrado!')
        return Response({"error": "Produto não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    if produto.estoque < quantidade:
        print(f'❌ Estoque insuficiente para {produto.nome}: {produto.estoque} disponíveis')
        return Response({"error": "Estoque insuficiente"}, status=status.HTTP_400_BAD_REQUEST)

    # Usar o método adicionar_item do modelo Mesa
    mesa.adicionar_item(produto, quantidade)

    # Atualizar o estoque
    produto.estoque -= quantidade
    produto.save()
    print(f'✅ Estoque atualizado: {produto.estoque}')

    serializer = MesaSerializer(mesa)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
      
@api_view(['POST'])
def remover_item_mesa(request, slug):
    print(f'🚀 Tentando remover item da mesa com slug: {slug}')
    try:
        mesa = Mesa.objects.get(slug=slug)
        print(f'✅ Mesa encontrada: {mesa.nome}')
    except Mesa.DoesNotExist:
        print(f'❌ Mesa com slug {slug} não encontrada!')
        return Response({"error": "Mesa não encontrada"}, status=status.HTTP_404_NOT_FOUND)

    item_id = request.data.get('produto_id')  # Aqui 'produto_id' é o ID do ItemMesa, mas mantemos o nome por consistência
    if not item_id:
        print('❌ Item ID não fornecido!')
        return Response({"error": "Item ID é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        item = ItemMesa.objects.get(id=item_id, mesa=mesa)
        produto = item.produto_id  # Ajustado de produto para produto_id
        print(f'✅ Item encontrado: {item.produto_nome}, quantidade: {item.quantidade}')
    except ItemMesa.DoesNotExist:
        print(f'❌ Item com ID {item_id} não encontrado na mesa {mesa.nome}!')
        return Response({"error": "Item não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    quantidade = item.quantidade
    item.delete()
    produto.estoque += quantidade
    produto.save()
    print(f'✅ Item removido da mesa {mesa.nome}, estoque atualizado: {produto.estoque}')

    if not mesa.items.exists():
        mesa.status = 'Livre'
        mesa.pedido = 0
        mesa.save()
        print(f'✅ Mesa {mesa.nome} redefinida para o estado inicial')

    serializer = MesaSerializer(mesa)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def cancelar_pedido(request, slug):
    try:
        mesa = Mesa.objects.get(slug=slug)
        mesa.cancelar_pedido()  # Chama o método do modelo
        return Response({"message": "Pedido cancelado com sucesso"}, status=status.HTTP_200_OK)
    except Mesa.DoesNotExist:
        return Response({"error": "Mesa não encontrada"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"Erro interno do servidor: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




