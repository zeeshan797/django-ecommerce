from rest_framework import serializers
from .models import Cart, CartItem
from products.models import Product
from products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True, required=False)
    product_name = serializers.CharField(source='product.name', read_only=True)
    unit_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'product_name', 'unit_price', 'quantity', 'total_price']
        read_only_fields = ['id', 'product', 'product_name', 'unit_price', 'total_price']
    
    def get_total_price(self, obj):
        return obj.total_price

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_items', 'total_price']
    
    def get_total_items(self, obj):
        return obj.total_items
    
    def get_total_price(self, obj):
        return obj.total_price