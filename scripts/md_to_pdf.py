import textwrap
from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor

INPUT = Path('PROJECT_DESCRIPTION.md')
OUTPUT = Path('PROJECT_DESCRIPTION.pdf')

lines = INPUT.read_text(encoding='utf-8').splitlines()
canvas = Canvas(str(OUTPUT), pagesize=letter)
width, height = letter
margin = 0.75 * inch
max_width = width - 2 * margin
current_y = height - margin

heading_color = HexColor('#1F4E79')
subheading_color = HexColor('#2D6A96')
text_color = HexColor('#202020')
line_color = HexColor('#CCCCCC')

page_number_y = margin * 0.5


def new_page():
    global current_y
    canvas.showPage()
    current_y = height - margin
    draw_page_number()


def draw_page_number():
    page_num = canvas.getPageNumber()
    canvas.setFont('Helvetica', 9)
    canvas.setFillColor(HexColor('#666666'))
    canvas.drawRightString(width - margin, page_number_y, f'Page {page_num}')


def draw_wrapped_text(text, font_name, font_size, indent=0):
    global current_y
    wrapper = textwrap.wrap(text, width=int((max_width - indent) / (font_size * 0.55)))
    for wrapped_line in wrapper:
        if current_y < margin + font_size * 1.5:
            new_page()
        canvas.setFont(font_name, font_size)
        canvas.setFillColor(text_color)
        canvas.drawString(margin + indent, current_y, wrapped_line)
        current_y -= font_size * 1.4


def draw_heading(text, level):
    global current_y
    if current_y < margin + 40:
        new_page()
    if level == 1:
        canvas.setFont('Helvetica-Bold', 24)
        canvas.setFillColor(heading_color)
        canvas.drawString(margin, current_y, text)
        current_y -= 28
    elif level == 2:
        canvas.setFont('Helvetica-Bold', 18)
        canvas.setFillColor(subheading_color)
        canvas.drawString(margin, current_y, text)
        current_y -= 24
    else:
        canvas.setFont('Helvetica-Bold', 14)
        canvas.setFillColor(subheading_color)
        canvas.drawString(margin, current_y, text)
        current_y -= 20
    canvas.setStrokeColor(line_color)
    canvas.setLineWidth(1)
    canvas.line(margin, current_y + 4, width - margin, current_y + 4)
    current_y -= 8


def draw_bullet(text, indent=16):
    global current_y
    bullet = '• '
    draw_wrapped_text(bullet + text, 'Helvetica', 11, indent)


def draw_section_separator():
    global current_y
    current_y -= 12
    if current_y < margin + 20:
        new_page()
    canvas.setStrokeColor(line_color)
    canvas.setLineWidth(0.5)
    canvas.line(margin, current_y, width - margin, current_y)
    current_y -= 16


for raw in lines:
    text = raw.rstrip()
    if not text:
        current_y -= 10
        continue

    if text.startswith('# '):
        draw_heading(text[2:].strip(), 1)
        continue
    if text.startswith('## '):
        draw_heading(text[3:].strip(), 2)
        continue
    if text.startswith('### '):
        draw_heading(text[4:].strip(), 3)
        continue
    if text.startswith('----') or text.startswith('---'):
        draw_section_separator()
        continue
    if text.startswith('- '):
        draw_bullet(text[2:].strip())
        continue
    if text.startswith('    '):
        draw_wrapped_text(text.strip(), 'Courier', 10, indent=28)
        continue
    if text.startswith('```'):
        draw_wrapped_text(text, 'Courier', 10)
        continue

    draw_wrapped_text(text, 'Helvetica', 11)

# Draw page number on the final page
canvas.setFillColor(text_color)
draw_page_number()
canvas.save()
print(f'Created PDF: {OUTPUT.resolve()}')