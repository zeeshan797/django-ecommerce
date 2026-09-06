from django.urls import path, include
from .views import PaymentViewSet

urlpatterns = [
    path('', PaymentViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name='payment-list'),
    path('<int:pk>/', PaymentViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='payment-detail'),
    path('process-cod/', PaymentViewSet.as_view({
        'post': 'process_cod',
    }), name='payment-process-cod'),
]