from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import Product

class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Check if the user owns the cart
        return obj.user == request.user

class CartViewSet(viewsets.GenericViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Get or create cart for the current user with optimized prefetching
        cart, _ = Cart.objects.prefetch_related('items__product__images', 'items__product__category').get_or_create(user=self.request.user)
        return cart
    
    def list(self, request):
        # Return the cart for the current user
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_object()
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data.get('product_id') or request.data.get('product_id')
            quantity = serializer.validated_data.get('quantity', 1)
            
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if product.stock <= 0:
                return Response({'error': f'{product.name} is out of stock'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if item already in cart
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': min(quantity, product.stock)}
            )
            
            if not created:
                # If item already exists, increase quantity up to stock
                if cart_item.quantity + quantity > product.stock:
                    return Response({
                        'error': f'Cannot add more. Only {product.stock} available in stock ({cart_item.quantity} already in cart).'
                    }, status=status.HTTP_400_BAD_REQUEST)
                cart_item.quantity += quantity
                cart_item.save()
            
            # Return updated cart
            cart_serializer = CartSerializer(cart)
            return Response(cart_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch', 'delete'])
    def item(self, request, pk=None):
        cart = self.get_object()
        try:
            cart_item = CartItem.objects.select_related('product').get(id=pk, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'PATCH':
            new_qty = request.data.get('quantity')
            if new_qty is not None:
                try:
                    new_qty = int(new_qty)
                    if new_qty <= 0:
                        cart_item.delete()
                    elif new_qty > cart_item.product.stock:
                        return Response({
                            'error': f'Only {cart_item.product.stock} available in stock.'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        cart_item.quantity = new_qty
                        cart_item.save()
                    
                    cart_serializer = CartSerializer(cart)
                    return Response(cart_serializer.data)
                except ValueError:
                    return Response({'error': 'Invalid quantity.'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({'error': 'Quantity not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            cart_item.delete()
            # Return updated cart
            cart_serializer = CartSerializer(cart)
            return Response(cart_serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart = self.get_object()
        cart.items.all().delete()
        # Return updated cart
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)