from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['uuid', 'name', 'description', 'slug']
        read_only_fields = ['uuid', 'slug']

class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    available = serializers.SerializerMethodField()
    
    def get_available(self, obj):
        return obj.is_available and obj.stock_quantity > 0
    
    class Meta:
        model = Product
        fields = [
            'uuid', 'name', 'description', 'price', 
            'image', 'category', 'rating', 'slug',
            'stock_quantity', 'is_available', 'available', 'specifications'
        ]
        read_only_fields = ['uuid', 'slug', 'rating', 'available']

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    related_products = ProductListSerializer(many=True, read_only=True)
    available = serializers.SerializerMethodField()
    
    def get_available(self, obj):
        return obj.is_available and obj.stock_quantity > 0
    
    class Meta:
        model = Product
        fields = [
            'uuid', 'name', 'description', 'price', 
            'image', 'category', 'rating', 'slug',
            'stock_quantity', 'is_available', 'available',
            'related_products', 'specifications'
        ]
        read_only_fields = ['uuid', 'slug', 'rating', 'available'] 


class ProductSerializer(serializers.ModelSerializer):
    stock_status =  serializers.SerializerMethodField()

    def get_stock_status(self, obj):
        if not obj.is_available:
            return "unavailable"
        if obj.stock_quantity == 0:
            return "out_of_stock"
        return "in_stock"