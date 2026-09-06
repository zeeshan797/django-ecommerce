from django.urls import path, include
from .views import OrderViewSet

urlpatterns = [
    path('', OrderViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name='order-list'),
    path('<int:pk>/', OrderViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='order-detail'),
    path('from-cart/', OrderViewSet.as_view({
        'post': 'from_cart',
    }), name='order-from-cart'),
    path('<int:pk>/cancel/', OrderViewSet.as_view({
        'post': 'cancel',
    }), name='order-cancel'),
]