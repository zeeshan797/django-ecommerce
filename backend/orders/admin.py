from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'product_sku', 'unit_price', 'total_price']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'email', 'order_status', 'payment_status', 'total_amount', 'created_at']
    list_filter = ['order_status', 'payment_status', 'created_at']
    search_fields = ['id', 'first_name', 'last_name', 'email']
    readonly_fields = ['full_name', 'full_address', 'created_at', 'updated_at']
    inlines = [OrderItemInline]

    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Full Name'

    def full_address(self, obj):
        return format_html("<pre>{}</pre>", obj.full_address)
    full_address.short_description = 'Address'

    fieldsets = (
        ('Customer Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Shipping Address', {
            'fields': ('address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country')
        }),
        ('Order Details', {
            'fields': ('order_status', 'payment_status', 'payment_method', 'coupon', 'discount_amount', 'tax_amount', 'shipping_amount', 'total_amount')
        }),
        ('Notes', {
            'fields': ('order_notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )