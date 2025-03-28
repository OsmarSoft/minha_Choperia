# Scripts para População do Banco de Dados

Este diretório contém scripts para popular o banco de dados com dados iniciais.

## Como usar

1. Certifique-se de que o ambiente virtual está ativado
2. Navegue até o diretório do projeto Django:
   ```bash
   cd backend/notas_choperia
   ```

3. Execute o script:
   ```bash
   python produto/scripts/populate_db.py
   ```

## Estrutura dos Dados

O script `populate_db.py` cria produtos iniciais com as seguintes categorias:
- CERVEJA
- COMIDA
- BEBIDA

Cada produto inclui:
- Nome
- Descrição
- Preço
- Categoria
- URL da imagem
- Status de disponibilidade