from django.urls import path, include
from .views import CouponViewSet

urlpatterns = [
    path('', CouponViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name='coupon-list'),
    path('<int:pk>/', CouponViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='coupon-detail'),
    path('validate/', CouponViewSet.as_view({
        'post': 'validate',
    }), name='coupon-validate'),
]