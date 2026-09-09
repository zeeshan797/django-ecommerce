from django.db.models import Count
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, ProductImage
from .serializers import CategorySerializer, ProductSerializer, ProductImageSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow read-only access to non-admin users, and full access to admin users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(product_count=Count('products'))
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_featured']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['-created_at']

    def get_object(self):
        lookup = str(self.kwargs.get(self.lookup_field, ''))
        queryset = self.filter_queryset(self.get_queryset())
        if lookup.isdigit():
            obj = queryset.filter(id=int(lookup)).first()
        else:
            obj = queryset.filter(slug__iexact=lookup).first()
        if obj is None:
            from rest_framework.exceptions import NotFound
            raise NotFound('Product not found')
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        qs = Product.objects.select_related('category').prefetch_related('images')
        
        # Support category filter by slug or numeric ID
        category = self.request.query_params.get('category', None)
        if category:
            if category.isdigit():
                qs = qs.filter(category_id=int(category))
            else:
                qs = qs.filter(category__slug__iexact=category)
                
        # Support price filtering
        min_price = self.request.query_params.get('min_price', None)
        if min_price is not None:
            try:
                qs = qs.filter(price__gte=float(min_price))
            except ValueError:
                pass
                
        max_price = self.request.query_params.get('max_price', None)
        if max_price is not None:
            try:
                qs = qs.filter(price__lte=float(max_price))
            except ValueError:
                pass
                
        # Support featured filter
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            qs = qs.filter(is_featured=(featured.lower() == 'true'))
            
        # Support availability filter
        availability = self.request.query_params.get('availability', None)
        if availability == 'in_stock':
            qs = qs.filter(stock__gt=0)
        elif availability == 'out_of_stock':
            qs = qs.filter(stock=0)
            
        # Support rating filter
        rating = self.request.query_params.get('rating', None)
        if rating is not None:
            try:
                min_rating = int(rating)
                if min_rating > 0:
                    qs = qs.filter(reviews__rating__gte=min_rating).distinct()
            except ValueError:
                pass

        return qs


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        # Optionally filter by product ID if provided
        queryset = ProductImage.objects.all()
        product_id = self.request.query_params.get('product', None)
        if product_id is not None:
            queryset = queryset.filter(product_id=product_id)
        return queryset