import json
from collections import OrderedDict
from pathlib import Path

MONTH_NAMES = {'04':'abril','05':'maio','06':'junho','07':'julho','08':'agosto','09':'setembro','10':'outubro','11':'novembro','12':'dezembro'}
MONTH_LABEL = {'04':'Abril','05':'Maio','06':'Junho','07':'Julho','08':'Agosto','09':'Setembro','10':'Outubro','11':'Novembro','12':'Dezembro'}
SECTION_TITLES = {
    'revisao_rapida': 'Revisão rápida',
    'abertura': 'Abertura',
    'atividade_principal': 'Atividade principal',
    'atividade_criativa': 'Atividade criativa',
    'fechamento': 'Fechamento',
}


def load_entries(base_path: Path):
    entries = []
    for line in base_path.read_text(encoding='utf-8').splitlines():
        if line.strip():
            entries.append(json.loads(line))
    return entries


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
    repo_root = Path('.').resolve()
    base_path = repo_root / 'base' / 'ayka_base_repositorio_2026.jsonl'
    entries = load_entries(base_path)
    months = OrderedDict()
    for e in entries:
        months.setdefault(e['date'][5:7], []).append(e)

    apostilas_root = repo_root / 'apostilas' / '2026'
    apostilas_root.mkdir(parents=True, exist_ok=True)

    for m, items in months.items():
        month_dir = apostilas_root / f"{m}-{MONTH_NAMES[m]}"
        month_dir.mkdir(parents=True, exist_ok=True)
        (month_dir / '.gitkeep').write_text('', encoding='utf-8')
        lines = [f"# {MONTH_LABEL[m]} de 2026\n", f"**Tema do mês:** {items[0]['month_theme']}\n", f"**Quantidade de arquivos-base:** {len(items)}\n", '## Arquivos do mês\n']
        for e in items:
            filename = Path(e['repo_path']).name
            lines.append(f"- [{e['date']} · {e['title']}](./{filename})")
            (month_dir / filename).write_text(daily_content(e), encoding='utf-8')
        (month_dir / 'README.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')

    print('Estrutura mensal regenerada com sucesso.')


if __name__ == '__main__':
    main()
