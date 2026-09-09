from rest_framework import serializers
from .models import Category, Product, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'created_at', 'product_count']
        read_only_fields = ['id', 'created_at', 'product_count']
    
    def get_product_count(self, obj):
        return getattr(obj, 'product_count', obj.products.count())

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_main']
        read_only_fields = ['id']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    discount_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category', 'category_id', 'description', 'price', 
                 'compare_price', 'discount_percentage', 'is_active', 'is_featured', 
                 'stock', 'created_at', 'updated_at', 'images']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'discount_percentage']
    
    def get_discount_percentage(self, obj):
        return obj.discount_percentage