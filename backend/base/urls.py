from base import views
from django.urls import path

urlpatterns = [
    path('register', views.register),
    path('login', views.MyTokenObtainPairView.as_view()),
    path('refresh-token', views.refresh_token),
    path('updateUser', views.update_user),
    path('products/', views.products_public),
    path('products/<int:id>', views.products_public),
    path('authproducts', views.products),
    path('authproducts/<int:id>', views.products),
    path('api/orders/create/', views.create_order, name='create_order'),  # Changed path for creating orders
    path('api/orders/<str:order_id>/capture/', views.capture_order, name='capture_order'),
    path('api/orders/', views.get_orders, name='get_orders'),  # Path for fetching orders
    path('api/products/<int:product_id>/reviews/', views.product_reviews, name='product_reviews'),  # Add this line
]
