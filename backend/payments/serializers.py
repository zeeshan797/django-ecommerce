from rest_framework import serializers
from .models import Payment
from orders.models import Order
from orders.serializers import OrderSerializer

class PaymentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    order_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'order', 'order_id', 'payment_method', 'amount', 'transaction_id', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'order']