import textwrap
from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch

INPUT = Path('PROJECT_DESCRIPTION.md')
OUTPUT = Path('PROJECT_DESCRIPTION.pdf')

lines = INPUT.read_text(encoding='utf-8').splitlines()

canvas = Canvas(str(OUTPUT), pagesize=letter)
width, height = letter
margin = 0.75 * inch
max_width = width - 2 * margin
current_y = height - margin
line_height = 14

style_map = {
    '# ': 18,
    '## ': 16,
    '### ': 14,
    '- ': 12,
    '    ': 10,
    '```': 10
}

for raw in lines:
    text = raw.rstrip()
    if not text:
        current_y -= line_height
        if current_y < margin:
            canvas.showPage()
            current_y = height - margin
        continue

    font_size = 12
    indent = 0
    prefix = ''

    if text.startswith('# '):
        font_size = style_map['# ']
        prefix = ''
        text = text[2:]
    elif text.startswith('## '):
        font_size = style_map['## ']
        prefix = ''
        text = text[3:]
    elif text.startswith('### '):
        font_size = style_map['### ']
        prefix = ''
        text = text[4:]
    elif text.startswith('- '):
        font_size = style_map['- ']
        prefix = '• '
        text = text[2:]
        indent = 12
    elif text.startswith('    '):
        font_size = style_map['    ']
        indent = 18
    elif text.startswith('```'):
        font_size = style_map['```']
        current_y -= line_height / 2
        if current_y < margin:
            canvas.showPage()
            current_y = height - margin
        canvas.setFont('Courier', font_size)
        canvas.drawString(margin, current_y, text)
        current_y -= line_height
        continue

    wrapper = textwrap.wrap(prefix + text, width=int(max_width / (font_size * 0.6)))
    for wrapped in wrapper:
        if current_y < margin + line_height:
            canvas.showPage()
            current_y = height - margin
        canvas.setFont('Helvetica-Bold' if font_size >= 16 else 'Helvetica', font_size)
        canvas.drawString(margin + indent, current_y, wrapped)
        current_y -= line_height

canvas.save()
print(f'Created PDF: {OUTPUT.resolve()}')