from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
import django_filters.rest_framework as filters
from .models import Payment
from .serializers import PaymentSerializer
from orders.models import Order

class IsPaymentOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of a payment to view it.
    Assumes the payment has an order with a user attribute.
    """
    def has_object_permission(self, request, view, obj):
        # Staff users can view all payments
        if request.user.is_staff:
            return True
        # Regular users can only view payments for their own orders
        return obj.order.user == request.user

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = []
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Staff can see all payments, regular users only see payments for their own orders
        if self.request.user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(order__user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def process_cod(self, request):
        """Process Cash on Delivery payment for an order"""
        order_id = request.data.get('order_id')
        
        if not order_id:
            return Response({'error': 'Order ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user owns the order (unless staff)
        if not request.user.is_staff and order.user != request.user:
            return Response({'error': 'You do not have permission to pay for this order'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Check if order is pending
        if order.payment_status != 'pending':
            return Response({'error': 'Order is not pending payment'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if payment already exists for this order
        if hasattr(order, 'payment'):
            return Response({'error': 'Payment already exists for this order'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create payment
        payment = Payment.objects.create(
            order=order,
            payment_method='cod',
            amount=order.total_amount,
            status='paid'  # COD is considered paid immediately (will be paid on delivery)
        )
        
        # Update order payment status
        order.payment_status = 'paid'
        order.save()
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)