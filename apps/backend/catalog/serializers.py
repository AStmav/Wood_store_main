from rest_framework import serializers

from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    parent_uuid = serializers.UUIDField(source='parent.uuid', read_only=True, allow_null=True)
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'uuid', 'name', 'description', 'slug',
            'parent_uuid', 'sort_order', 'image', 'is_active', 'product_count',
        ]
        read_only_fields = ['uuid', 'slug', 'parent_uuid', 'product_count']

    def get_product_count(self, obj) -> int:
        if hasattr(obj, 'product_count'):
            return obj.product_count
        return obj.products.count()


class CategoryTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    parent_uuid = serializers.UUIDField(source='parent.uuid', read_only=True, allow_null=True)

    class Meta:
        model = Category
        fields = [
            'uuid', 'name', 'description', 'slug',
            'parent_uuid', 'sort_order', 'image', 'is_active', 'children',
        ]
        read_only_fields = fields

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by('sort_order', 'name')
        return CategoryTreeSerializer(children, many=True, context=self.context).data


class CategoryDetailSerializer(CategorySerializer):
    breadcrumbs = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields + ['breadcrumbs', 'children']

    def get_breadcrumbs(self, obj):
        return CategorySerializer(obj.get_breadcrumbs(), many=True).data

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by('sort_order', 'name')
        return CategorySerializer(children, many=True).data


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
            'stock_quantity', 'is_available', 'available', 'specifications',
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
            'related_products', 'specifications',
        ]
        read_only_fields = ['uuid', 'slug', 'rating', 'available']


class ProductSerializer(serializers.ModelSerializer):
    stock_status = serializers.SerializerMethodField()

    def get_stock_status(self, obj):
        if not obj.is_available:
            return 'unavailable'
        if obj.stock_quantity == 0:
            return 'out_of_stock'
        return 'in_stock'