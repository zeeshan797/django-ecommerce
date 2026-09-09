from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import F
import django_filters.rest_framework as filters
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from cart.models import Cart
from products.models import Product
from coupons.models import Coupon


class IsOrderOwner(permissions.BasePermission):
    """
    Object-level permission:
    - Staff users can perform any action.
    - Owners can retrieve and cancel their own orders.
    - Other actions (PUT/PATCH/DELETE) are staff-only.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if view.action in ['retrieve', 'cancel']:
            return obj.user == request.user
        return False

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderOwner]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['order_status', 'payment_status']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        base_qs = Order.objects.select_related('user', 'coupon').prefetch_related('items__product__images', 'items__product__category')
        if self.request.user.is_staff:
            return base_qs
        return base_qs.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        return Response(
            {'error': 'Direct order creation is not permitted. Use /api/orders/from-cart/ to place orders.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['post'])
    def from_cart(self, request):
        """Create an order from the current user's cart with inventory stock validation"""
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
        
        cart_items = list(cart.items.select_related('product'))
        if not cart_items:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate inventory stock before proceeding
        for cart_item in cart_items:
            if cart_item.product.stock < cart_item.quantity:
                return Response({
                    'error': f"Insufficient stock for '{cart_item.product.name}'. Only {cart_item.product.stock} available."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        phone = request.data.get('phone', '')
        address_line_1 = request.data.get('address_line_1')
        address_line_2 = request.data.get('address_line_2', '')
        city = request.data.get('city')
        state = request.data.get('state')
        postal_code = request.data.get('postal_code')
        country = request.data.get('country')
        order_notes = request.data.get('order_notes', '')
        coupon_id = request.data.get('coupon_id')
        
        required_fields = ['first_name', 'last_name', 'email', 'address_line_1', 'city', 'state', 'postal_code', 'country']
        missing_fields = [field for field in required_fields if not request.data.get(field)]
        if missing_fields:
            return Response({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cart_total = cart.total_price
        discount_amount = 0
        tax_amount = 0
        shipping_amount = 0
        
        coupon = None
        if coupon_id:
            try:
                coupon = Coupon.objects.get(id=coupon_id)
                if not coupon.is_valid:
                    return Response({'error': 'Coupon is not valid or has expired'}, status=status.HTTP_400_BAD_REQUEST)
                discount_amount = coupon.discount_amount(cart_total)
            except Coupon.DoesNotExist:
                return Response({'error': 'Coupon not found'}, status=status.HTTP_404_NOT_FOUND)
        
        total_amount = cart_total - discount_amount + tax_amount + shipping_amount
        if total_amount < 0:
            total_amount = 0
        
        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone,
                address_line_1=address_line_1,
                address_line_2=address_line_2,
                city=city,
                state=state,
                postal_code=postal_code,
                country=country,
                order_notes=order_notes,
                coupon=coupon,
                discount_amount=discount_amount,
                tax_amount=tax_amount,
                shipping_amount=shipping_amount,
                total_amount=total_amount,
                payment_method='cod',
                payment_status='pending',
                order_status='pending'
            )
            
            # Deduct inventory stock and create order items
            for cart_item in cart_items:
                # Decrement stock
                Product.objects.filter(id=cart_item.product.id).update(stock=F('stock') - cart_item.quantity)
                
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    product_name=cart_item.product.name,
                    product_sku='',
                    quantity=cart_item.quantity,
                    unit_price=cart_item.product.price,
                    total_price=cart_item.total_price
                )
            
            # Clear cart items
            cart.items.all().delete()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a pending order and restore inventory stock"""
        order = self.get_object()
        
        if order.order_status != 'pending':
            return Response({'error': 'Only pending orders can be cancelled'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            order.order_status = 'cancelled'
            order.payment_status = 'cancelled'
            order.save()
            
            # Restore stock
            for item in order.items.select_related('product'):
                if item.product_id:
                    Product.objects.filter(id=item.product_id).update(stock=F('stock') + item.quantity)
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)