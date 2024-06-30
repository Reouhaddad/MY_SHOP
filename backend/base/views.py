from django.shortcuts import render
from rest_framework import serializers
from rest_framework.response import Response
from base.models import Product, Order, OrderItem, Review
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from rest_framework import status
from django.core.files.storage import default_storage
from django.db.models import Q
import json
import requests
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

# Génère un jeton d'accès pour l'API PayPal
def generate_access_token():
    auth = (settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET)
    response = requests.post(
        'https://api-m.sandbox.paypal.com/v1/oauth2/token',
        auth=auth,
        headers={'Accept': 'application/json', 'Accept-Language': 'en_US'},
        data={'grant_type': 'client_credentials'}
    )
    return response.json().get('access_token')

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    user = request.user
    items_data = request.data.get('items', [])
    full_name = request.data.get('fullName', '')
    email = request.data.get('email', '')
    address = request.data.get('address', '')
    city = request.data.get('city', '')
    state = request.data.get('state', '')
    zip_code = request.data.get('zip', '')
    
    total_price = sum(float(item['amount']) * float(item['price']) for item in items_data)

    order = Order.objects.create(
        user=user,
        full_name=full_name,
        email=email,
        address=address,
        city=city,
        state=state,
        zip_code=zip_code,
        total_price=total_price
    )

    for item_data in items_data:
        product = Product.objects.get(id=item_data['id'])
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=item_data['amount'],
            price=item_data['price']
        )

    access_token = generate_access_token()
    url = 'https://api-m.sandbox.paypal.com/v2/checkout/orders'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }
    data = {
        'intent': 'CAPTURE',
        'purchase_units': [{
            'amount': {
                'currency_code': 'USD',
                'value': f'{total_price:.2f}'
            }
        }]
    }
    response = requests.post(url, headers=headers, data=json.dumps(data))
    return JsonResponse(response.json())

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def capture_order(request, order_id):
    access_token = generate_access_token()
    url = f'https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/capture'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }
    response = requests.post(url, headers=headers)
    return JsonResponse(response.json())

@api_view(['GET'])
@permission_classes([AllowAny])
def products_public(req, id=-1):
    if req.method == 'GET':
        if id > -1:
            try:
                temp_product = Product.objects.get(id=id)
                return Response(ProductSerializer(temp_product, many=False).data)
            except Product.DoesNotExist:
                return Response("not found")
        all_products = ProductSerializer(Product.objects.all(), many=True).data
        return Response(all_products)

@api_view(['GET', 'POST', 'DELETE', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def products(req, id=-1):
    if req.method == 'GET':
        search_query = req.query_params.get('search', None)

        if id > -1:
            try:
                temp_product = Product.objects.get(id=id)
                return Response(ProductSerializer(temp_product, many=False).data)
            except Product.DoesNotExist:
                return Response("not found")

        queryset = Product.objects.all()

        if search_query:
            queryset = queryset.filter(Q(name__icontains=search_query))

        all_products = ProductSerializer(queryset, many=True).data
        return Response(all_products)
    
    if req.method == 'POST':
        tsk_serializer = ProductSerializer(data=req.data)
        if tsk_serializer.is_valid():
            tsk_serializer.save()
            temp_product = tsk_serializer.instance
            tsk_serializer = ProductSerializer(temp_product, data=req.data)
            if tsk_serializer.is_valid():
                tsk_serializer.save()
                return Response("posted")
            else:
                return Response(tsk_serializer.errors)
        else:
            return Response(tsk_serializer.errors)
    
    if req.method == 'DELETE':
        try:
            temp_product = Product.objects.get(id=id)
        except Product.DoesNotExist:
            return Response("not found")

        if temp_product.img:
            default_storage.delete(temp_product.img.path)

        temp_product.delete()
        return Response("deleted")
    
    if req.method in ['PUT', 'PATCH']:
        try:
            temp_product = Product.objects.get(id=id)
        except Product.DoesNotExist:
            return Response("not found", status=status.HTTP_404_NOT_FOUND)

        api_serializer = ProductSerializer(temp_product, data=req.data, partial=True)

        if api_serializer.is_valid():
            api_serializer.save()
            old_image_path = temp_product.img.path if temp_product.img else None

            image_file = req.data.get('img')
            if image_file:
                if old_image_path and default_storage.exists(old_image_path):
                    default_storage.delete(old_image_path)

                temp_product.img = image_file
                temp_product.save()

            return Response(api_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(api_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['admin'] = user.is_superuser
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['POST'])
def register(request):
    user = User.objects.create_user(
        username=request.data['username'],
        password=request.data['password'],
        first_name=request.data['first_name'],
        last_name=request.data['last_name'],
        email=request.data['email'],
        is_superuser=request.data['is_superuser']
    )
    user.save()
    return Response("new user created")

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    refresh_token = request.data.get('refreshToken')

    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=400)

    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        return Response({'access': access_token}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # This will display the username instead of the user ID

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment']

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request): 
    try:
        user = request.user
        user.first_name = request.data.get('firstName', user.first_name)
        user.last_name = request.data.get('lastName', user.last_name)
        user.email = request.data.get('email', user.email)
        user.save()
        return Response({
            'username': user.username,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'email': user.email
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    user = request.user
    orders = Order.objects.filter(user=user)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated])
def product_reviews(request, product_id):
    if request.method == 'GET':
        reviews = Review.objects.filter(product_id=product_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        user = request.user
        product = Product.objects.get(id=product_id)
        rating = request.data.get('rating')
        comment = request.data.get('comment')

        review = Review.objects.create(
            user=user,
            product=product,
            rating=rating,
            comment=comment
        )
        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
