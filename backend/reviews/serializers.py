from rest_framework import serializers
from .models import Review
from products.models import Product
from products.serializers import ProductSerializer
from django.contrib.auth.models import User
from accounts.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), 
        source='product', 
        write_only=True
    )
    user = UserSerializer(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'product_id', 'product_name', 'user', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'product_name', 'created_at', 'updated_at']