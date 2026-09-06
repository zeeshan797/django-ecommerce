from rest_framework import serializers
from .models import Review
from products.models import Product
from products.serializers import ProductSerializer
from django.contrib.auth.models import User
from accounts.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'product', 'product_id', 'user', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']