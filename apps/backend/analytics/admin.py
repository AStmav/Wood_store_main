import json
from datetime import timedelta

from django.contrib import admin
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone

from .models import ProductView, SiteVisit


@admin.register(ProductView)
class ProductViewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'session_id', 'ip_address', 'created_at')
    list_filter = ('product', 'created_at')
    search_fields = ('product__name', 'session_id', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
    change_list_template = 'admin/analytics/productview/change_list.html'

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}

        period_start = timezone.now() - timedelta(days=6)

        top_products_qs = (
            ProductView.objects.filter(created_at__gte=period_start)
            .values('product__name')
            .annotate(total=Count('id'))
            .order_by('-total')[:5]
        )
        top_products_labels = [item['product__name'] for item in top_products_qs]
        top_products_values = [item['total'] for item in top_products_qs]

        dates = [
            (period_start + timedelta(days=i)).date()
            for i in range(7)
        ]
        visits_by_date = {
            item['date']: item['total']
            for item in SiteVisit.objects.filter(created_at__gte=period_start)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(total=Count('id'))
        }
        visits_labels = [date.strftime('%d.%m') for date in dates]
        visits_values = [visits_by_date.get(date, 0) for date in dates]

        extra_context.update({
            'top_products_labels': json.dumps(top_products_labels, ensure_ascii=False),
            'top_products_values': json.dumps(top_products_values),
            'visits_labels': json.dumps(visits_labels, ensure_ascii=False),
            'visits_values': json.dumps(visits_values),
            'period_start': period_start.date().strftime('%d.%m.%Y'),
            'period_end': timezone.now().date().strftime('%d.%m.%Y'),
        })

        return super().changelist_view(request, extra_context=extra_context)


@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display = ('path', 'user', 'session_id', 'ip_address', 'created_at')
    list_filter = ('path', 'created_at')
    search_fields = ('path', 'session_id', 'user__email', 'ip_address')
    readonly_fields = ('created_at', 'updated_at')


