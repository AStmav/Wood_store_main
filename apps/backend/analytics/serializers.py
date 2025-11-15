from rest_framework import serializers

from catalog.models import Product
from .models import ProductView, SiteVisit


class ProductViewSerializer(serializers.ModelSerializer):
    product = serializers.SlugRelatedField(slug_field='uuid', queryset=Product.objects.all())

    class Meta:
        model = ProductView
        fields = ('product', 'path', 'referrer')


class SiteVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteVisit
        fields = ('path', 'referrer')


