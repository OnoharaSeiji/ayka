# Ayka Apostilas

Repositório-base do projeto pedagógico diário da Ayka para 2026, com foco em progressão pedagógica, linguagem lúdica e geração diária de apostilas.

## Estrutura do projeto

```text
ayka-apostilas/
├── README.md
├── .gitignore
├── base/
│   ├── ayka_base_repositorio_2026.md
│   └── ayka_base_repositorio_2026.jsonl
├── templates/
│   ├── template_apostila.md
│   └── template_semana.md
├── apostilas/
│   └── 2026/
│       ├── 04-abril/
│       ├── 05-maio/
│       ├── 06-junho/
│       ├── 07-julho/
│       ├── 08-agosto/
│       ├── 09-setembro/
│       ├── 10-outubro/
│       ├── 11-novembro/
│       └── 12-dezembro/
├── assets/
│   ├── imagens/
│   ├── moldes/
│   └── referencias/
└── scripts/
    ├── README.md
    ├── gerar_apostila_dia.py
    └── organizar_base.py
```

## O que já está pronto

- base anual consolidada em `.md` e `.jsonl`;
- todos os arquivos-base diários de **01/04/2026 a 31/12/2026**;
- templates de apostila e de semana;
- índices mensais;
- scripts para gerar ou reorganizar os arquivos a partir da base;
- estrutura pronta para upload no GitHub.

## Comandos úteis

```bash
python scripts/gerar_apostila_dia.py --date 2026-04-01
python scripts/organizar_base.py
```

## Meses do projeto

- `04-abril`: 30 arquivos-base · tema do mês: **Adaptação, rotina, natureza e observação**
- `05-maio`: 31 arquivos-base · tema do mês: **Leitura, palavras, rimas e animais**
- `06-junho`: 30 arquivos-base · tema do mês: **Brasil, cultura, medidas e dinheiro**
- `07-julho`: 31 arquivos-base · tema do mês: **Férias criativas, revisão e ciência divertida**
- `08-agosto`: 31 arquivos-base · tema do mês: **Corpo humano, saúde, alimentação e movimento**
- `09-setembro`: 30 arquivos-base · tema do mês: **Plantas, água, clima, animais pequenos e meio ambiente**
- `10-outubro`: 31 arquivos-base · tema do mês: **Imaginação, artes, invenções, música e expressão**
- `11-novembro`: 30 arquivos-base · tema do mês: **Cidadania, profissões, gratidão e educação financeira**
- `12-dezembro`: 31 arquivos-base · tema do mês: **Revisão geral, autonomia, portfólio e celebração**

## Próximo passo sugerido
Usar este repositório como fonte única e expandir diariamente apenas o arquivo do dia.
