from django.urls import path, include
from .views import CartViewSet

urlpatterns = [
    path('', CartViewSet.as_view({
        'get': 'list',
    }), name='cart'),
    path('add-item/', CartViewSet.as_view({
        'post': 'add_item',
    }), name='cart-add-item'),
    path('item/<int:pk>/', CartViewSet.as_view({
        'patch': 'item',
        'delete': 'item',
    }), name='cart-item'),
    path('clear/', CartViewSet.as_view({
        'delete': 'clear',
    }), name='cart-clear'),
]