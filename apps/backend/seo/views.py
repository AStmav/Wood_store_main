from __future__ import annotations

import json
import re
from decimal import Decimal
from html import escape

from django.conf import settings
from django.http import HttpResponse, HttpResponseNotFound
from django.utils.html import strip_tags
from django.views.decorators.http import require_GET

from about.models import About
from catalog.category_tree import get_descendant_pks
from catalog.models import Category, Product
from news.models import News
from pages.models import Page

from .sitemaps import site_base_url

UUID_RE = re.compile(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    re.I,
)

SITE_NAME = 'Сказкин Дом'
DEFAULT_DESCRIPTION = (
    'Сказкин Дом — детская мебель и игрушки в Якутске. '
    'Кровати, матрасы, столы и стулья с доставкой и сборкой.'
)


def _abs_media(path: str | None) -> str | None:
    if not path:
        return None
    if str(path).startswith('http'):
        return str(path)
    base = site_base_url()
    return f'{base}{path}' if str(path).startswith('/') else f'{base}/{path}'


def _truncate(text: str, limit: int = 160) -> str:
    text = ' '.join((text or '').split())
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + '…'


def _html_shell(
    *,
    title: str,
    description: str,
    canonical: str,
    og_image: str | None,
    h1: str,
    body_html: str,
    json_ld: list | dict | None = None,
) -> str:
    base = site_base_url()
    image = og_image or f'{base}/logo.png'
    ld_blocks = ''
    if json_ld:
        payloads = json_ld if isinstance(json_ld, list) else [json_ld]
        for payload in payloads:
            ld_blocks += (
                '<script type="application/ld+json">'
                f'{json.dumps(payload, ensure_ascii=False)}'
                '</script>\n'
            )

    return f'''<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{escape(title)}</title>
  <meta name="description" content="{escape(description)}" />
  <link rel="canonical" href="{escape(canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="{escape(SITE_NAME)}" />
  <meta property="og:title" content="{escape(title)}" />
  <meta property="og:description" content="{escape(description)}" />
  <meta property="og:url" content="{escape(canonical)}" />
  <meta property="og:image" content="{escape(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="robots" content="index,follow" />
  {ld_blocks}
</head>
<body>
  <header>
    <a href="{escape(base)}/">{escape(SITE_NAME)}</a>
    <nav>
      <a href="{escape(base)}/">Каталог</a>
      <a href="{escape(base)}/about">О компании</a>
      <a href="{escape(base)}/delivery">Доставка</a>
    </nav>
  </header>
  <main>
    <h1>{escape(h1)}</h1>
    {body_html}
  </main>
  <footer>
    <p>{escape(SITE_NAME)} — детская мебель в Якутске</p>
    <p><a href="https://wa.me/79141023232">+7 (914) 102-32-32</a></p>
  </footer>
</body>
</html>
'''


def _org_ld() -> dict:
    base = site_base_url()
    return {
        '@context': 'https://schema.org',
        '@type': 'FurnitureStore',
        'name': SITE_NAME,
        'url': base,
        'telephone': '+7-914-102-32-32',
        'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Якутск',
            'addressCountry': 'RU',
        },
        'image': f'{base}/logo.png',
    }


def _resolve_product(lookup: str) -> Product | None:
    qs = Product.objects.filter(is_available=True).select_related('category').prefetch_related('images')
    if UUID_RE.match(lookup):
        return qs.filter(uuid=lookup).first()
    return qs.filter(slug=lookup).first()


def _resolve_category(lookup: str) -> Category | None:
    qs = Category.objects.filter(is_active=True)
    if UUID_RE.match(lookup):
        return qs.filter(uuid=lookup).first()
    return qs.filter(slug=lookup).first()


def _product_page(product: Product) -> HttpResponse:
    base = site_base_url()
    canonical = f'{base}/product/{product.slug}'
    description = _truncate(product.description or f'{product.name} — купить в {SITE_NAME}, Якутск')
    images = []
    for img in product.images.all()[:5]:
        url = _abs_media(img.image.url if img.image else None)
        if url:
            images.append(url)
    if not images and product.image:
        url = _abs_media(product.image.url)
        if url:
            images.append(url)

    offer = {
        '@type': 'Offer',
        'url': canonical,
        'availability': 'https://schema.org/InStock',
        'priceCurrency': 'RUB',
    }
    if product.price_on_request:
        offer['price'] = '0'
        offer['description'] = 'Цена по запросу'
    else:
        price = product.sale_price if product.has_discount else product.price
        offer['price'] = str(price if isinstance(price, Decimal) else price)

    product_ld = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.name,
        'description': description,
        'sku': str(product.uuid),
        'image': images or [f'{base}/logo.png'],
        'offers': offer,
    }
    if product.category_id:
        product_ld['category'] = product.category.name

    crumbs = [
        {'@type': 'ListItem', 'position': 1, 'name': 'Главная', 'item': f'{base}/'},
    ]
    if product.category_id:
        crumbs.append({
            '@type': 'ListItem',
            'position': 2,
            'name': product.category.name,
            'item': f'{base}/catalog/{product.category.slug}',
        })
        crumbs.append({
            '@type': 'ListItem',
            'position': 3,
            'name': product.name,
            'item': canonical,
        })
    else:
        crumbs.append({
            '@type': 'ListItem',
            'position': 2,
            'name': product.name,
            'item': canonical,
        })

    breadcrumb_ld = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': crumbs,
    }

    specs = ''
    if product.specifications:
        rows = ''.join(
            f'<li><strong>{escape(str(k))}:</strong> {escape(str(v))}</li>'
            for k, v in product.specifications.items()
        )
        specs = f'<h2>Характеристики</h2><ul>{rows}</ul>'

    img_html = ''
    if images:
        img_html = f'<p><img src="{escape(images[0])}" alt="{escape(product.name)}" /></p>'

    price_html = (
        '<p>Цена по запросу</p>'
        if product.price_on_request
        else f'<p>Цена: {escape(str(offer["price"]))} ₽</p>'
    )

    body = (
        f'{img_html}'
        f'<p>{escape(product.description or description)}</p>'
        f'{price_html}'
        f'{specs}'
        f'<p><a href="{escape(canonical)}">Смотреть на сайте</a></p>'
    )
    html = _html_shell(
        title=f'{product.name} — {SITE_NAME}',
        description=description,
        canonical=canonical,
        og_image=images[0] if images else None,
        h1=product.name,
        body_html=body,
        json_ld=[_org_ld(), product_ld, breadcrumb_ld],
    )
    return HttpResponse(html)


def _category_page(category: Category) -> HttpResponse:
    base = site_base_url()
    canonical = f'{base}/catalog/{category.slug}'
    description = _truncate(
        category.description or f'{category.name} — каталог {SITE_NAME} в Якутске'
    )
    cat_ids = get_descendant_pks(category)
    products = (
        Product.objects.filter(category_id__in=cat_ids, is_available=True)
        .select_related('category')
        .order_by('-created_at')[:40]
    )
    items = ''.join(
        f'<li><a href="{escape(base)}/product/{escape(p.slug)}">{escape(p.name)}</a></li>'
        for p in products
    )
    body = (
        f'<p>{escape(category.description or description)}</p>'
        f'<h2>Товары</h2><ul>{items or "<li>Товары скоро появятся</li>"}</ul>'
    )
    breadcrumb_ld = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Главная', 'item': f'{base}/'},
            {'@type': 'ListItem', 'position': 2, 'name': category.name, 'item': canonical},
        ],
    }
    html = _html_shell(
        title=f'{category.name} — {SITE_NAME}',
        description=description,
        canonical=canonical,
        og_image=None,
        h1=category.name,
        body_html=body,
        json_ld=[_org_ld(), breadcrumb_ld],
    )
    return HttpResponse(html)


def _home_page() -> HttpResponse:
    base = site_base_url()
    categories = Category.objects.filter(is_active=True, parent__isnull=True).order_by('sort_order', 'name')
    products = Product.objects.filter(is_available=True).order_by('-created_at')[:24]
    cat_list = ''.join(
        f'<li><a href="{escape(base)}/catalog/{escape(c.slug)}">{escape(c.name)}</a></li>'
        for c in categories
    )
    prod_list = ''.join(
        f'<li><a href="{escape(base)}/product/{escape(p.slug)}">{escape(p.name)}</a></li>'
        for p in products
    )
    body = (
        f'<p>{escape(DEFAULT_DESCRIPTION)}</p>'
        f'<h2>Категории</h2><ul>{cat_list}</ul>'
        f'<h2>Новинки</h2><ul>{prod_list}</ul>'
    )
    html = _html_shell(
        title=f'{SITE_NAME} — детская мебель в Якутске',
        description=DEFAULT_DESCRIPTION,
        canonical=f'{base}/',
        og_image=f'{base}/logo.png',
        h1=f'{SITE_NAME} — каталог детской мебели',
        body_html=body,
        json_ld=_org_ld(),
    )
    return HttpResponse(html)


@require_GET
def robots_txt(request):
    base = site_base_url()
    content = (
        'User-agent: *\n'
        'Allow: /\n'
        'Disallow: /admin/\n'
        'Disallow: /api/\n'
        'Disallow: /my-products\n'
        'Disallow: /swagger/\n'
        'Disallow: /redoc/\n'
        f'Sitemap: {base}/sitemap.xml\n'
    )
    return HttpResponse(content, content_type='text/plain; charset=utf-8')


@require_GET
def seo_render(request, path: str = ''):
    """HTML-оболочка для поисковых ботов (nginx проксирует сюда по User-Agent)."""
    raw = (path or request.path or '/').strip()
    if not raw.startswith('/'):
        raw = '/' + raw
    # nginx may pass full path or stripped
    if raw.startswith('/seo/render'):
        raw = raw[len('/seo/render'):] or '/'

    if raw in ('', '/'):
        return _home_page()

    if raw.rstrip('/') == '/about':
        about = About.objects.first()
        title = about.title if about else f'О компании — {SITE_NAME}'
        text = strip_tags(about.content) if about and about.content else DEFAULT_DESCRIPTION
        html = _html_shell(
            title=title,
            description=_truncate(text),
            canonical=f'{site_base_url()}/about',
            og_image=None,
            h1=title,
            body_html=f'<div>{about.content if about else escape(DEFAULT_DESCRIPTION)}</div>',
            json_ld=_org_ld(),
        )
        return HttpResponse(html)

    for slug, title, text in (
        ('delivery', 'Доставка и сборка', 'Доставка и сборка детской мебели по Якутску.'),
        ('warranty', 'Гарантия', 'Гарантия на мебель и условия обслуживания.'),
        ('installment', 'Рассрочка', 'Условия рассрочки и оплаты.'),
    ):
        if raw.rstrip('/') == f'/{slug}':
            html = _html_shell(
                title=f'{title} — {SITE_NAME}',
                description=text,
                canonical=f'{site_base_url()}/{slug}',
                og_image=None,
                h1=title,
                body_html=f'<p>{escape(text)}</p><p>Свяжитесь с нами: +7 (914) 102-32-32</p>',
                json_ld=_org_ld(),
            )
            return HttpResponse(html)

    m = re.match(r'^/product/([^/]+)/?$', raw)
    if m:
        product = _resolve_product(m.group(1))
        if product:
            return _product_page(product)
        return HttpResponseNotFound('Product not found')

    m = re.match(r'^/catalog/([^/]+)/?$', raw)
    if m:
        category = _resolve_category(m.group(1))
        if category:
            return _category_page(category)
        return HttpResponseNotFound('Category not found')

    m = re.match(r'^/news/([^/]+)/?$', raw)
    if m:
        news = News.objects.filter(is_active=True, slug=m.group(1)).first()
        if not news:
            return HttpResponseNotFound('News not found')
        text = strip_tags(news.content or news.excerpt or news.title)
        html = _html_shell(
            title=f'{news.title} — {SITE_NAME}',
            description=_truncate(news.excerpt or text),
            canonical=f'{site_base_url()}/news/{news.slug}',
            og_image=_abs_media(news.image.url) if getattr(news, 'image', None) and news.image else None,
            h1=news.title,
            body_html=f'<article>{news.content or escape(text)}</article>',
            json_ld=_org_ld(),
        )
        return HttpResponse(html)

    m = re.match(r'^/pages/([^/]+)/?$', raw)
    if m:
        page = Page.objects.filter(is_active=True, slug=m.group(1)).first()
        if not page:
            return HttpResponseNotFound('Page not found')
        text = strip_tags(page.content or page.title)
        html = _html_shell(
            title=f'{page.title} — {SITE_NAME}',
            description=_truncate(text),
            canonical=f'{site_base_url()}/pages/{page.slug}',
            og_image=None,
            h1=page.title,
            body_html=f'<article>{page.content}</article>',
            json_ld=_org_ld(),
        )
        return HttpResponse(html)

    # fallback — homepage-like shell so bots never get empty SPA
    return _home_page()
