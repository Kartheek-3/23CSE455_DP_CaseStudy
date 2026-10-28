#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def font(size: int, bold: bool = False):
    return ImageFont.truetype(BOLD if bold else FONT, size)


def canvas(title: str):
    image = Image.new("RGB", (1600, 900), "#F7F8FA")
    draw = ImageDraw.Draw(image)
    draw.text((70, 45), title, fill="#172B4D", font=font(36, True))
    draw.line((70, 105, 1530, 105), fill="#2B6CB0", width=4)
    return image, draw


def box(draw, xy, title, lines=(), fill="#FFFFFF", border="#2B6CB0"):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, 18, fill=fill, outline=border, width=3)
    draw.text((x1 + 22, y1 + 18), title, fill="#172B4D", font=font(23, True))
    y = y1 + 58
    for line in lines:
        draw.text((x1 + 22, y), line, fill="#3B4A63", font=font(18))
        y += 31


def arrow(draw, start, end, label=""):
    draw.line((*start, *end), fill="#4A5568", width=4)
    x, y = end
    if abs(end[0] - start[0]) > abs(end[1] - start[1]):
        points = [(x, y), (x - 15 if x > start[0] else x + 15, y - 9), (x - 15 if x > start[0] else x + 15, y + 9)]
    else:
        points = [(x, y), (x - 9, y - 15 if y > start[1] else y + 15), (x + 9, y - 15 if y > start[1] else y + 15)]
    draw.polygon(points, fill="#4A5568")
    if label:
        label_font = font(16)
        horizontal = abs(end[0] - start[0]) > abs(end[1] - start[1])
        center_x = (start[0] + end[0]) / 2
        center_y = (start[1] + end[1]) / 2
        if horizontal:
            center_y -= 25
        else:
            center_x += 38
        bounds = draw.textbbox((0, 0), label, font=label_font)
        width = bounds[2] - bounds[0]
        height = bounds[3] - bounds[1]
        x = center_x - width / 2
        y = center_y - height / 2
        draw.rounded_rectangle(
            (x - 7, y - 5, x + width + 7, y + height + 5),
            radius=6,
            fill="#F7F8FA",
        )
        draw.text((x, y), label, fill="#2D3748", font=label_font)


def architecture():
    image, draw = canvas("Laravel-style property rental architecture")
    boxes = [
        ((60, 170, 300, 330), "Clients", ["Owner", "Tenant", "Administrator"]),
        ((390, 180, 650, 320), "Laravel HTTP", ["routes/web.php", "Resource routes"]),
        ((760, 150, 1060, 350), "Middleware + requests", ["auth + role", "SecurityHeaders", "FormRequest validation"]),
        ((1180, 150, 1510, 350), "Controllers", ["Property / owner / tenant", "Receipts + deposits", "Blade response selection"]),
        ((760, 500, 1060, 700), "Eloquent models", ["Property / Owner / Tenant", "Receipts / deposits", "DigitalContract (evolved)"]),
        ((1180, 500, 1510, 700), "Infrastructure", ["MySQL / MariaDB", "Blade + DomPDF", "Laravel services"]),
    ]
    for xy, title, lines in boxes: box(draw, xy, title, lines)
    arrow(draw, (300, 250), (390, 250), "request")
    arrow(draw, (650, 250), (760, 250), "pipeline")
    arrow(draw, (1060, 250), (1180, 250), "validated")
    arrow(draw, (910, 350), (910, 500), "query / persist")
    arrow(draw, (1060, 600), (1180, 600), "adapter")
    draw.text((70, 780), "Primary flow: route -> middleware / validation -> controller -> Eloquent -> view or redirect", fill="#172B4D", font=font(23, True))
    image.save(ROOT / "Part1/diagrams/architecture.png")


def baseline():
    image, draw = canvas("Baseline pattern collaborations")
    box(draw, (70, 170, 470, 380), "MVC: request coordination", ["routes/web.php", "Resource controllers", "Eloquent models", "Blade views"], fill="#EBF8FF")
    box(draw, (600, 170, 1000, 380), "Active Record: persistence", ["Property / Owner / Tenant", "Receipt models", "create / update / query", "belongsTo / hasMany"], fill="#F0FFF4", border="#2F855A")
    box(draw, (1130, 170, 1530, 380), "Chain: HTTP middleware", ["auth middleware", "RoleMiddleware", "SecurityHeaders", "next(request)"], fill="#FFFAF0", border="#B7791F")
    box(draw, (260, 520, 700, 740), "Template Method: validation", ["Laravel FormRequest", "authorize() hook", "rules() hook", "Store / Update requests"], fill="#FAF5FF", border="#805AD5")
    box(draw, (900, 520, 1340, 740), "Facade: infrastructure", ["DB::transaction", "Hash::make", "TenantController client", "service-container proxies"], fill="#FFF5F5", border="#C53030")
    arrow(draw, (470, 275), (600, 275), "model operations")
    arrow(draw, (1130, 330), (1000, 330), "approved request")
    arrow(draw, (480, 520), (300, 380), "validated input")
    arrow(draw, (1120, 520), (850, 380), "infrastructure access")
    image.save(ROOT / "Part1/diagrams/baseline_patterns.png")


def evolved():
    image, draw = canvas("Evolution: added variation points")
    box(draw, (70, 170, 510, 390), "CH01 Strategy", ["PricingStrategy", "BasePricing", "DynamicPricing", "PricingService"], fill="#EBF8FF")
    box(draw, (580, 170, 1030, 430), "CH02 Specification", ["PropertySpecification", "AndSpecification", "City / Rent / Amenity", "Available / Furnished"], fill="#F0FFF4", border="#2F855A")
    box(draw, (1100, 170, 1530, 430), "CH03 State", ["ContractState", "Draft / Sent", "Signed / Expired", "DigitalContract context"], fill="#FFFAF0", border="#B7791F")
    box(draw, (180, 570, 570, 740), "Stable client", ["Controller or service", "depends on interface", "selects behavior at runtime"], fill="#FFFFFF")
    box(draw, (660, 570, 1050, 740), "Composition", ["Rules combine without", "nested controller IFs", "open for new filters"], fill="#FFFFFF")
    box(draw, (1140, 570, 1530, 740), "Lifecycle safety", ["State owns allowed action", "invalid transition throws", "signature hash retained"], fill="#FFFFFF")
    arrow(draw, (290, 390), (355, 570))
    arrow(draw, (800, 430), (855, 570))
    arrow(draw, (1300, 430), (1335, 570))
    image.save(ROOT / "Part2/diagrams/evolved_patterns.png")


def sequence():
    image, draw = canvas("Tenant booking and digital-contract flow")
    names = ["Tenant", "SearchService", "Specification", "PricingService", "DigitalContract"]
    xs = [120, 430, 750, 1070, 1390]
    for x, name in zip(xs, names):
        box(draw, (x - 90, 150, x + 90, 220), name, ())
        draw.line((x, 220, x, 820), fill="#A0AEC0", width=2)
    steps = [
        (120, 430, 300, "advanced(spec)"), (430, 750, 380, "isSatisfiedBy"),
        (120, 1070, 470, "quote(context)"), (120, 1390, 560, "send()"),
        (1390, 1390, 650, "Draft -> Sent"), (120, 1390, 740, "sign(hash)"),
        (1390, 1390, 800, "Sent -> Signed"),
    ]
    for start_x, end_x, y, label in steps:
        if start_x == end_x:
            draw.arc((start_x - 10, y - 30, start_x + 90, y + 30), 270, 90, fill="#4A5568", width=3)
            draw.text((start_x + 20, y - 25), label, fill="#2D3748", font=font(16))
        else:
            arrow(draw, (start_x, y), (end_x, y), label)
    image.save(ROOT / "Part2/diagrams/evolution_sequence.png")


if __name__ == "__main__":
    architecture(); baseline(); evolved(); sequence()
