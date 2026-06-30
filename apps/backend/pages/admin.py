from django.contrib import admin

from .models import Page


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'slug', 'content')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('uuid', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'content', 'is_active'),
        }),
        ('Системная информация', {
            'fields': ('uuid', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
