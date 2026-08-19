from rest_framework import serializers

from .models import Product, Category, ProductImage


class CategoryBriefSerializer(serializers.ModelSerializer):
    """Лёгкая категория без product_count (без N+1 в списках товаров)."""

    class Meta:
        model = Category
        fields = ['uuid', 'name', 'slug']
        read_only_fields = fields


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
        return CategoryBriefSerializer(obj.get_breadcrumbs(), many=True).data

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by('sort_order', 'name')
        return CategorySerializer(children, many=True).data


class ProductPricingMixin(serializers.Serializer):
    discount_percent = serializers.IntegerField(read_only=True)
    sale_price = serializers.SerializerMethodField()
    has_discount = serializers.SerializerMethodField()

    def get_sale_price(self, obj):
        if obj.has_discount and obj.sale_price is not None:
            return obj.sale_price
        return None

    def get_has_discount(self, obj) -> bool:
        return obj.has_discount


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'sort_order']
        read_only_fields = fields


class ProductListSerializer(ProductPricingMixin, serializers.ModelSerializer):
    category = CategoryBriefSerializer(read_only=True)
    image = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    is_orderable = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'uuid', 'name', 'description', 'price', 'price_on_request',
            'discount_percent', 'sale_price', 'has_discount',
            'availability_status', 'is_orderable',
            'image', 'category', 'slug',
        ]
        read_only_fields = ['uuid', 'slug']

    def get_image(self, obj):
        # В сетке отдаём компактное превью, если есть
        field = obj.image_card or obj.image
        if not field:
            return None
        return field.url

    def get_description(self, obj):
        text = (obj.description or '').strip()
        if len(text) <= 160:
            return text
        return text[:157].rstrip() + '…'


class ProductDetailSerializer(ProductPricingMixin, serializers.ModelSerializer):
    category = CategoryBriefSerializer(read_only=True)
    related_products = ProductListSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    is_orderable = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'uuid', 'name', 'description', 'price', 'price_on_request',
            'discount_percent', 'sale_price', 'has_discount',
            'availability_status', 'is_orderable',
            'image', 'images', 'category', 'slug', 'related_products', 'specifications',
        ]
        read_only_fields = ['uuid', 'slug']
