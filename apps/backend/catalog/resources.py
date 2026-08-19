from import_export import fields, resources
from import_export.widgets import ForeignKeyWidget

from catalog.models import Category, Product


class CategoryResource(resources.ModelResource):
    class Meta:
        model = Category
        fields = ('id', 'uuid', 'name', 'description', 'slug')
        export_order = ('id', 'uuid', 'name', 'description', 'slug')
        import_id_fields = ('name',)


class ProductResource(resources.ModelResource):
    category = fields.Field(
        column_name='category',
        attribute='category',
        widget=ForeignKeyWidget(Category, 'name'),
    )

    class Meta:
        model = Product
        fields = (
            'uuid',
            'name',
            'description',
            'price',
            'price_on_request',
            'category',
            'is_available',
            'availability_status',
            'slug',
        )
        export_order = (
            'uuid',
            'name',
            'description',
            'price',
            'price_on_request',
            'category',
            'is_available',
            'availability_status',
            'slug',
        )
        skip_unchanged = True
