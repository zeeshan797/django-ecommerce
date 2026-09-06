from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
import django_filters.rest_framework as filters
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from cart.models import Cart
from products.models import Product
from coupons.models import Coupon

class IsOrderOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an order to view it.
    """
    def has_object_permission(self, request, view, obj):
        # Staff users can view all orders
        if request.user.is_staff:
            return True
        # Regular users can only view their own orders
        return obj.user == request.user

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['order_status', 'payment_status']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Staff can see all orders, regular users only see their own
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Set the user to the current user
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def from_cart(self, request):
        """Create an order from the current user's cart"""
        # Get the user's cart
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if cart has items
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get data from request
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
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'address_line_1', 'city', 'state', 'postal_code', 'country']
        missing_fields = [field for field in required_fields if not request.data.get(field)]
        if missing_fields:
            return Response({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate totals
        cart_total = cart.total_price
        discount_amount = 0
        tax_amount = 0  # Could be calculated based on location
        shipping_amount = 0  # Could be calculated based on weight/location
        
        # Apply coupon if provided
        coupon = None
        if coupon_id:
            try:
                coupon = Coupon.objects.get(id=coupon_id)
                if not coupon.is_valid:
                    return Response({'error': 'Coupon is not valid'}, status=status.HTTP_400_BAD_REQUEST)
                discount_amount = coupon.discount_amount(cart_total)
            except Coupon.DoesNotExist:
                return Response({'error': 'Coupon not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate final total
        total_amount = cart_total - discount_amount + tax_amount + shipping_amount
        if total_amount < 0:
            total_amount = 0
        
        # Create order in a transaction
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
                payment_method='cod',  # Cash on Delivery for now
                payment_status='pending',
                order_status='pending'
            )
            
            # Create order items from cart items
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    product_name=cart_item.product.name,
                    product_sku='',  # We don't have SKU in Product model yet
                    quantity=cart_item.quantity,
                    unit_price=cart_item.product.price,
                    total_price=cart_item.total_price
                )
            
            # Clear the cart
            cart.items.all().delete()
        
        # Return the created order
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order"""
        order = self.get_object()
        
        # Only allow cancelling pending orders
        if order.order_status != 'pending':
            return Response({'error': 'Only pending orders can be cancelled'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        order.order_status = 'cancelled'
        order.payment_status = 'cancelled'
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)