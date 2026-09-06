from rest_framework import serializers
from .models import Coupon
from django.utils import timezone

class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'description', 'discount_type', 'discount_value', 
                 'valid_from', 'valid_to', 'is_active', 'usage_limit', 
                 'usage_limit_per_user', 'minimum_order_amount', 'is_valid',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_valid']
    
    def get_is_valid(self, obj):
        return obj.is_valid