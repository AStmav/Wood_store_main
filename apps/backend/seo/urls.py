from django.contrib.sitemaps.views import sitemap
from django.urls import path, re_path

from .sitemaps import sitemaps
from .views import robots_txt, seo_render

urlpatterns = [
    path('robots.txt', robots_txt, name='robots_txt'),
    path(
        'sitemap.xml',
        sitemap,
        {'sitemaps': sitemaps},
        name='django.contrib.sitemaps.views.sitemap',
    ),
    re_path(r'^seo/render(?P<path>/.*)?$', seo_render, name='seo_render'),
]
