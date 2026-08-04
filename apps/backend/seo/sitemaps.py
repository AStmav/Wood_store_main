from django.conf import settings
from django.contrib.sitemaps import Sitemap

from about.models import About
from catalog.models import Category, Product
from news.models import News
from pages.models import Page


def site_base_url() -> str:
    return getattr(settings, 'SITE_URL', 'https://skazkindomykt.ru').rstrip('/')


class StaticViewSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.8

    def items(self):
        return [
            ('/', 1.0, 'daily'),
            ('/about', 0.7, 'monthly'),
            ('/delivery', 0.6, 'monthly'),
            ('/warranty', 0.5, 'monthly'),
            ('/installment', 0.5, 'monthly'),
            ('/terms', 0.3, 'yearly'),
            ('/privacy', 0.3, 'yearly'),
        ]

    def location(self, item):
        return item[0]

    def priority(self, item):
        return item[1]

    def changefreq(self, item):
        return item[2]


class ProductSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.9

    def items(self):
        return Product.objects.filter(is_available=True).only('slug', 'updated_at').order_by('slug')

    def location(self, obj):
        return f'/product/{obj.slug}'

    def lastmod(self, obj):
        return obj.updated_at


class CategorySitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.8

    def items(self):
        return Category.objects.filter(is_active=True).only('slug', 'updated_at').order_by('slug')

    def location(self, obj):
        return f'/catalog/{obj.slug}'

    def lastmod(self, obj):
        return obj.updated_at


class NewsSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.6

    def items(self):
        return News.objects.filter(is_active=True).only('slug', 'updated_at').order_by('slug')

    def location(self, obj):
        return f'/news/{obj.slug}'

    def lastmod(self, obj):
        return obj.updated_at


class PageSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.4

    def items(self):
        return Page.objects.filter(is_active=True).only('slug', 'updated_at').order_by('slug')

    def location(self, obj):
        return f'/pages/{obj.slug}'

    def lastmod(self, obj):
        return obj.updated_at


class AboutSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.6

    def items(self):
        return About.objects.all()[:1]

    def location(self, obj):
        return '/about'


sitemaps = {
    'static': StaticViewSitemap,
    'products': ProductSitemap,
    'categories': CategorySitemap,
    'news': NewsSitemap,
    'pages': PageSitemap,
    'about': AboutSitemap,
}
