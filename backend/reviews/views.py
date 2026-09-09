from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Review
from .serializers import ReviewSerializer
from products.models import Product

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model has a `user` attribute.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the review.
        return obj.user == request.user

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'rating']
    
    def get_queryset(self):
        """
        Optionally restrict reviews to those for a specific product,
        or to reviews by the current user.
        """
        queryset = Review.objects.select_related('user', 'product')
        product_id = self.request.query_params.get('product', None)
        if product_id is not None:
            queryset = queryset.filter(product_id=product_id)
        
        # If user wants to see their own reviews
        mine = self.request.query_params.get('mine', None)
        if mine is not None and mine.lower() == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(user=self.request.user)
            
        return queryset
    
    def perform_create(self, serializer):
        # Set the user to the current user
        serializer.save(user=self.request.user)