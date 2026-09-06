from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product
from products.serializers import ProductSerializer
from coupons.models import Coupon
from coupons.serializers import CouponSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id', 'product', 'product_name', 'product_sku', 'unit_price', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    coupon = CouponSerializer(read_only=True)
    coupon_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Order
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'address_line_1', 'address_line_2', 
                 'city', 'state', 'postal_code', 'country', 'order_notes', 'order_status', 'payment_status', 
                 'payment_method', 'coupon', 'coupon_id', 'discount_amount', 'tax_amount', 'shipping_amount', 
                 'total_amount', 'created_at', 'updated_at', 'items']
        read_only_fields = ['id', 'created_at', 'updated_at', 'discount_amount', 'tax_amount', 'shipping_amount', 
                           'total_amount']