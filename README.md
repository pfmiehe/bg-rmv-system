# Sistema de Remoção de Fundo de Imagem e Centralização da Visualização

Esse projeto consiste em uma aplicação web que permite fazer upload de imagens, remover a cor de fundo e encontrar o "centro visual" da imagem. A aplicação é composta por um front-end em React e um back-end em Flask (Python).

## Requisitos

- Node.js (versão 14 ou superior)
- Python (versão 3.7 ou superior)
- npm (gerenciador de pacotes Node)
- pip (gerenciador de pacotes Python)

### Clonando o Repositório

```bash
git clone https://github.com/pfmiehe/bg-rmv-system.git
```

## Instalar dependências do front-end
1. Entrar na pasta frontend via terminal
2. Executar o comando: `npm install`


## Ambiente virtual Python
1. Entrar na pasta backend via terminal
2. criar um ambiente virtual
3. ativar o ambiente virtual

- (Passo 2) `python3 -m venv venv`
- (Passo 3) `source venv/bin/activate` (MacOS)
- (Passo 3) `venv\Scripts\activate` (Windows)

### Instalar as dependências do back-end
pip install -r requirements.txt

## Ligar o servidor do back-end
Executar no terminal dentro da pasta backend o comando: `python3 run.py`

## Ligar o servidor do front-end
Executar no terminal dentro da pasta backend o comando: `npm start`



