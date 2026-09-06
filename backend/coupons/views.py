from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Coupon
from .serializers import CouponSerializer
from django.utils import timezone
from decimal import Decimal

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow read-only access to non-admin users, and full access to admin users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['discount_type', 'is_active', 'valid_from', 'valid_to']
    
    def get_permissions(self):
        if self.action == 'validate':
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'])
    def validate(self, request):
        """Validate a coupon code"""
        code = request.data.get('code')
        order_amount = request.data.get('order_amount', 0)
        
        if not code:
            return Response({'error': 'Coupon code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'error': 'Coupon not found'})
        
        if not coupon.is_valid:
            return Response({'valid': False, 'error': 'Coupon is not valid or has expired'})
        
        order_amount_decimal = Decimal(str(order_amount))
        discount_amount = coupon.discount_amount(order_amount_decimal)
        
        return Response({
            'valid': True,
            'code': coupon.code,
            'description': coupon.description,
            'discount_type': coupon.discount_type,
            'discount_value': float(coupon.discount_value),
            'discount_amount': float(discount_amount),
            'final_amount': float(order_amount_decimal - discount_amount)
        })