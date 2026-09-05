from django.contrib import admin
from django.utils.html import format_html
from .models import Coupon

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'is_active', 'is_valid', 'valid_from', 'valid_to']
    list_filter = ['discount_type', 'is_active', 'valid_from', 'valid_to']
    search_fields = ['code', 'description']
    readonly_fields = ['created_at', 'updated_at', 'is_valid']

    def is_valid(self, obj):
        return obj.is_valid
    is_valid.boolean = True
    is_valid.short_description = 'Is Valid'

    fieldsets = (
        (None, {
            'fields': ('code', 'description')
        }),
        ('Discount Details', {
            'fields': ('discount_type', 'discount_value')
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_to', 'is_active')
        }),
        ('Usage Limits', {
            'fields': ('usage_limit', 'usage_limit_per_user', 'minimum_order_amount')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )