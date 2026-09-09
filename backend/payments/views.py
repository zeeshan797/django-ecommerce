from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
import django_filters.rest_framework as filters
from .models import Payment
from .serializers import PaymentSerializer
from orders.models import Order

class IsPaymentOwner(permissions.BasePermission):
    """
    Object-level permission:
    - Staff users can perform any action.
    - Regular users can only retrieve payments for their own orders.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if view.action == 'retrieve':
            return obj.order.user == request.user
        return False

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('order__user')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPaymentOwner]
    filter_backends = []
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        base_qs = Payment.objects.select_related('order__user')
        if self.request.user.is_staff:
            return base_qs
        return base_qs.filter(order__user=self.request.user)
    
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
        
        # Check if payment already exists for this order
        if hasattr(order, 'payment'):
            return Response(PaymentSerializer(order.payment).data, status=status.HTTP_200_OK)
        
        # Create payment record for COD
        payment = Payment.objects.create(
            order=order,
            payment_method='cod',
            amount=order.total_amount,
            status='pending'  # Paid upon delivery
        )
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)