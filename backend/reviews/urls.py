from django.urls import path, include
from .views import ReviewViewSet

urlpatterns = [
    path('', ReviewViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name='review-list'),
    path('<int:pk>/', ReviewViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='review-detail'),
]