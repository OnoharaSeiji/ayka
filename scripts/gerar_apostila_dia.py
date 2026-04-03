import argparse
import json
from pathlib import Path

SECTION_TITLES = {
    'revisao_rapida': 'Revisão rápida',
    'abertura': 'Abertura',
    'atividade_principal': 'Atividade principal',
    'atividade_criativa': 'Atividade criativa',
    'fechamento': 'Fechamento',
}


def load_entries(base_path: Path):
    data = {}
    for line in base_path.read_text(encoding='utf-8').splitlines():
        if line.strip():
            obj = json.loads(line)
            data[obj['date']] = obj
    return data


def bullet(items):
    return '\n'.join(f'- {i}' for i in items)


def daily_content(e):
    sections = []
    for idx, sec in enumerate(e.get('booklet_sections', []), start=1):
        title = SECTION_TITLES.get(sec['id'], sec['id'].replace('_', ' ').title())
        sections.append(f"### {idx}. {title}\n{sec['descricao']}\n")
    special_parts = []
    if e.get('holiday'):
        special_parts.append(f"## Feriado\n{e['holiday']}")
    if e.get('special_date'):
        special_parts.append(f"## Data especial\n{e['special_date']}")
    special = '\n\n'.join(special_parts)
    content = f"""---
id: {e['id']}
date: {e['date']}
weekday: {e['weekday']}
week_number: {e['week_number']}
day_type: {e['day_type']}
duration_min: {e['duration_min']}
month_theme: {e['month_theme']}
week_subtheme: {e['week_subtheme']}
slug: {e['slug']}
repo_path: apostilas/{e['repo_path']}
---

# {e['title']}

## Dados do dia
- **Data:** {e['date']}
- **Dia da semana:** {e['weekday']}
- **Tipo do dia:** {e['day_type']}
- **Duração sugerida:** {e['duration_min']} min
- **Tema do mês:** {e['month_theme']}
- **Subtema da semana:** {e['week_subtheme']}

## Objetivo pedagógico
{e['goal']}

## Resumo lúdico
{e['playful_summary']}

## Direção editorial
{e['editorial_direction']}

## Gancho do dia
{e['hook']}

## Rotina sugerida
{bullet(e.get('routine', []))}

## Materiais
{bullet(e.get('materials', []))}

## Estrutura da apostila do dia
{''.join(sections)}
## Resultado esperado
{e['expected_result']}
"""
    if special:
        content += '\n' + special + '\n'
    content += """
## Observações para expansão diária
- manter linguagem simples e concreta;
- conectar o conteúdo ao cotidiano da Ayka;
- inserir 3 a 5 perguntas curtas de checagem;
- incluir uma atividade artística, manual ou lúdica sempre que fizer sentido;
- finalizar com registro do que aprendeu no dia.
"""
    return content


def main():
    parser = argparse.ArgumentParser(description='Gera ou regenera uma apostila-base diária a partir do JSONL.')
    parser.add_argument('--date', required=True, help='Data no formato AAAA-MM-DD')
    parser.add_argument('--repo-root', default='.', help='Caminho para a raiz do repositório')
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    base_path = repo_root / 'base' / 'ayka_base_repositorio_2026.jsonl'
    entries = load_entries(base_path)

    if args.date not in entries:
        raise SystemExit(f'Data não encontrada na base: {args.date}')

    entry = entries[args.date]
    out_path = repo_root / 'apostilas' / entry['repo_path']
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(daily_content(entry), encoding='utf-8')
    print(f'Apostila gerada: {out_path}')


if __name__ == '__main__':
    main()
