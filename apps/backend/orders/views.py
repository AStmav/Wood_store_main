from django.shortcuts import render
from django.core.cache import cache
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.views import APIView
from .models import Order, OrderItem, Delivery, Payment, Cart, CartItem, Favorite
from catalog.models import Product
from .serializers import (
    OrderSerializer, OrderCreateSerializer,
    OrderItemSerializer, DeliverySerializer, PaymentSerializer,
    CartSerializer, CartItemSerializer, FavoriteSerializer, FavoriteListSerializer
)
from .services import OrderService, CartService
from catalog.services import ProductService
import threading


class IsAuthenticatedOrHasSession(BasePermission):
    """
    Разрешает доступ аутентифицированным пользователям или гостям с session_id
    """
    def has_permission(self, request, view):
        # Если пользователь аутентифицирован - разрешаем
        if request.user and request.user.is_authenticated:
            return True
        # Если есть session_id в заголовках - разрешаем (для гостей)
        session_id = request.META.get('HTTP_X_SESSION_ID')
        if session_id:
            return True
        # Если есть session_key - разрешаем
        if request.session and request.session.session_key:
            return True
        return False


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления заказами
    Требует аутентификации для всех операций
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    lookup_field = 'uuid'

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        """
        Возвращает список заказов пользователя
        """
        if getattr(self, 'swagger_fake_view', False):
            return Order.objects.none()
        
        print(f"OrderViewSet get_queryset: User: {self.request.user}")
        print(f"OrderViewSet get_queryset: User ID: {self.request.user.id}")
        print(f"OrderViewSet get_queryset: User email: {self.request.user.email}")
        print(f"OrderViewSet get_queryset: User is authenticated: {self.request.user.is_authenticated}")
        print(f"OrderViewSet get_queryset: User is anonymous: {self.request.user.is_anonymous}")
        
        # Проверяем, что пользователь аутентифицирован
        if not self.request.user.is_authenticated:
            print("OrderViewSet get_queryset: User is not authenticated!")
            return Order.objects.none()
        
        orders = Order.active_orders().filter(user=self.request.user)
        print(f"OrderViewSet get_queryset: Found {orders.count()} active orders")
        
        # Выводим детали найденных заказов
        for order in orders:
            print(f"OrderViewSet get_queryset: Order {order.uuid} - User: {order.user.email} - Status: {order.status}")
        
        return orders

    def get_serializer_class(self):
        """
        Возвращает соответствующий сериализатор в зависимости от действия
        """
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def list(self, request, *args, **kwargs):
        """
        Получение списка заказов пользователя
        """
        print(f"OrderViewSet list: Request user: {request.user}")
        print(f"OrderViewSet list: Request method: {request.method}")
        print(f"OrderViewSet list: Request path: {request.path}")
        
        queryset = self.filter_queryset(self.get_queryset())
        print(f"OrderViewSet list: Queryset count: {queryset.count()}")
        
        serializer = self.get_serializer(queryset, many=True)
        print(f"OrderViewSet list: Serialized data: {serializer.data}")
        
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Создание нового заказа
        """
        print(f"OrderViewSet create: Request user: {request.user}")
        print(f"OrderViewSet create: Request data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = request.user if request.user.is_authenticated else None
            order = OrderService.create_order(
                user=user,
                validated_data=serializer.validated_data
            )
            print(f"OrderViewSet create: Order created successfully: {order.uuid}")
            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print(f"OrderViewSet create: Error creating order: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, uuid=None):
        """
        Отмена заказа
        """
        order = self.get_object()
        try:
            order = OrderService.cancel_order(order)
            return Response(OrderSerializer(order).data)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, uuid=None):
        """
        Подтверждение оплаты заказа
        """
        order = self.get_object()
        try:
            order = OrderService.confirm_payment(order)
            return Response(OrderSerializer(order).data)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class CartViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления корзиной
    Поддерживает как аутентифицированных пользователей, так и гостей через session_id
    """
    permission_classes = [IsAuthenticatedOrHasSession]
    serializer_class = CartSerializer
    lookup_field = 'uuid'

    def get_queryset(self):
        """
        Возвращает корзину пользователя
        """
        if getattr(self, 'swagger_fake_view', False):
            return Cart.objects.none()
        return Cart.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        """
        Получение корзины пользователя
        """
        cart, created = CartService.get_or_create_cart(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Добавление товара в корзину
        """
        print(f"CartViewSet create: Request data: {request.data}")
        print(f"CartViewSet create: Request user: {request.user}")
        
        product_id = request.data.get('product')
        quantity = int(request.data.get('quantity', 1))
        
        print(f"CartViewSet create: Product ID: {product_id}, Quantity: {quantity}")
        
        if not product_id:
            print("CartViewSet create: No product_id provided")
            return Response(
                {"error": "Product ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart, created = CartService.get_or_create_cart(user=request.user)
        print(f"CartViewSet create: Cart created: {created}, Cart ID: {cart.id}")
        
        try:
            # Добавляем товар в корзину
            cart_item = CartService.add_to_cart(cart, product_id, quantity)
            print(f"CartViewSet create: Cart item created: {cart_item.id}")
            
            # Возвращаем обновленную корзину
            serializer = self.get_serializer(cart)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"CartViewSet create: Error: {str(e)}")
            import traceback
            print(f"CartViewSet create: Traceback: {traceback.format_exc()}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Product.DoesNotExist:
            print(f"CartViewSet create: Product not found: {product_id}")
            return Response(
                {"error": "Товар не найден"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def add_item(self, request, uuid=None):
        """
        Добавление товара в корзину
        """
        cart = self.get_object()
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            cart_item = CartService.add_to_cart(cart, product_id, quantity)
            return Response(
                CartItemSerializer(cart_item).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def update_item(self, request, uuid=None):
        """
        Обновление количества товара в корзине
        """
        cart = self.get_object()
        item_uuid = request.data.get('item_uuid')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            cart_item = cart.items.get(uuid=item_uuid)
            available_quantity = ProductService.get_available_quantity(cart_item.product.uuid)
             
            if available_quantity == 0:
                return Response(
                    {"error": "Товар недоступен"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if quantity > available_quantity:
                return Response(
                    {
                        "error": f"Доступно {available_quantity} шт.",
                        "max_quantity": available_quantity,
                        "request_quantity": quantity
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            updated_item = CartService.update_cart_item(cart_item, quantity)
            if updated_item:
                # Возвращаем обновленную корзину
                serializer = self.get_serializer(cart)
                return Response(serializer.data)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Товар не найден в корзине"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def remove_item(self, request, uuid=None):
        """
        Удаление товара из корзины
        """
        cart = self.get_object()
        item_uuid = request.data.get('item_uuid')
        
        try:
            cart_item = cart.items.get(uuid=item_uuid)
            CartService.remove_from_cart(cart_item)
            # Возвращаем обновленную корзину
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Товар не найден в корзине"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def clear(self, request, uuid=None):
        """
        Очистка корзины
        """
        cart = self.get_object()
        CartService.clear_cart(cart)
        # Возвращаем обновленную корзину
        serializer = self.get_serializer(cart)
        return Response(serializer.data)


class FavoriteViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления избранными товарами
    Поддерживает как зарегистрированных пользователей, так и гостей через session_id
    """
    permission_classes = [IsAuthenticatedOrHasSession]
    serializer_class = FavoriteSerializer
    lookup_field = 'uuid'
    
    # Защита от множественных запросов
    _request_locks = {}
    
    def get_session_id(self, request):
        """
        Получает session_id из заголовков или создает новый
        """
        session_id = request.META.get('HTTP_X_SESSION_ID')
        if not session_id:
            # Если нет session_id в заголовках, используем session_key
            session_id = request.session.session_key
            if not session_id:
                request.session.create()
                session_id = request.session.session_key
        return session_id

    def get_queryset(self):
        """
        Возвращает избранные товары пользователя или гостя с кешированием
        """
        if getattr(self, 'swagger_fake_view', False):
            return Favorite.objects.none()
        
        # Определяем идентификатор для кеширования
        if self.request.user.is_authenticated:
            cache_key = f'favorites_user_{self.request.user.id}'
            favorites = Favorite.objects.filter(user=self.request.user).select_related('product')
        else:
            session_id = self.get_session_id(self.request)
            cache_key = f'favorites_session_{session_id}'
            favorites = Favorite.objects.filter(session_id=session_id, user__isnull=True).select_related('product')
        
        # Проверяем кеш
        cached_favorites = cache.get(cache_key)
        if cached_favorites is not None:
            return cached_favorites
        
        # Защита от множественных запросов
        if cache_key not in self._request_locks:
            self._request_locks[cache_key] = threading.Lock()
        
        with self._request_locks[cache_key]:
            # Проверяем кеш еще раз после получения блокировки
            cached_favorites = cache.get(cache_key)
            if cached_favorites is not None:
                return cached_favorites
            
            cache.set(cache_key, favorites, 600)  # Кешируем на 10 минут
            return favorites

    def get_serializer_class(self):
        """
        Возвращает соответствующий сериализатор в зависимости от действия
        """
        if self.action == 'list':
            return FavoriteListSerializer
        return FavoriteSerializer

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """
        Добавление/удаление товара из избранного
        Поддерживает как зарегистрированных пользователей, так и гостей
        """
        product_id = request.data.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(uuid=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Товар не найден'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Определяем параметры для создания/поиска избранного
        if request.user.is_authenticated:
            # Зарегистрированный пользователь
            favorite, created = Favorite.objects.get_or_create(
                user=request.user,
                product=product,
                defaults={'session_id': None}
            )
            cache_key = f'favorites_user_{request.user.id}'
        else:
            # Гостевой пользователь
            session_id = self.get_session_id(request)
            favorite, created = Favorite.objects.get_or_create(
                session_id=session_id,
                product=product,
                defaults={'user': None}
            )
            cache_key = f'favorites_session_{session_id}'
        
        # Очищаем кеш
        cache.delete(cache_key)
        
        if created:
            serializer = self.get_serializer(favorite)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            favorite.delete()
            return Response(
                {'message': 'Товар удален из избранного'}, 
                status=status.HTTP_200_OK
            )

    @action(detail=False, methods=['get'])
    def count(self, request):
        """
        Получение количества избранных товаров
        """
        count = self.get_queryset().count()
        return Response({'count': count})

    @action(detail=False, methods=['post'])
    def sync_from_local(self, request):
        """
        Синхронизация избранного из localStorage при входе пользователя
        """
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Требуется аутентификация'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        local_favorites = request.data.get('favorites', [])
        synced_count = 0
        
        for product_id in local_favorites:
            try:
                product = Product.objects.get(uuid=product_id)
                favorite, created = Favorite.objects.get_or_create(
                    user=request.user,
                    product=product,
                    defaults={'session_id': None}
                )
                if created:
                    synced_count += 1
            except Product.DoesNotExist:
                continue
        
        # Очищаем кеш
        cache_key = f'favorites_user_{request.user.id}'
        cache.delete(cache_key)
        
        return Response({
            'message': f'Синхронизировано {synced_count} товаров',
            'synced_count': synced_count
        })


# ===== НОВЫЕ ПРОСТЫЕ API ДЛЯ ИЗБРАННОГО =====

class FavoritesListView(APIView):
    """
    Получение списка UUID избранных товаров
    Поддерживает как зарегистрированных пользователей, так и гостей
    """
    permission_classes = [IsAuthenticatedOrHasSession]
    
    def get_session_id(self, request):
        """Получает session_id из заголовков или создает новый"""
        session_id = request.META.get('HTTP_X_SESSION_ID')
        if not session_id:
            session_id = request.session.session_key
            if not session_id:
                request.session.create()
                session_id = request.session.session_key
        return session_id
    
    def get(self, request):
        """Получить список UUID избранных товаров"""
        try:
            if request.user.is_authenticated:
                favorite_uuids = Favorite.objects.filter(
                    user=request.user
                ).values_list('product__uuid', flat=True)
            else:
                session_id = self.get_session_id(request)
                favorite_uuids = Favorite.objects.filter(
                    session_id=session_id, 
                    user__isnull=True
                ).values_list('product__uuid', flat=True)
            
            return Response({
                'favorite_uuids': list(favorite_uuids)
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FavoritesDetailsView(APIView):
    """
    Получение деталей избранных товаров
    Поддерживает как зарегистрированных пользователей, так и гостей
    """
    permission_classes = [IsAuthenticatedOrHasSession]
    
    def get_session_id(self, request):
        """Получает session_id из заголовков или создает новый"""
        session_id = request.META.get('HTTP_X_SESSION_ID')
        if not session_id:
            session_id = request.session.session_key
            if not session_id:
                request.session.create()
                session_id = request.session.session_key
        return session_id
    
    def get(self, request):
        """Получить детали избранных товаров"""
        try:
            if request.user.is_authenticated:
                favorites = Favorite.objects.filter(
                    user=request.user
                ).select_related('product')
            else:
                session_id = self.get_session_id(request)
                favorites = Favorite.objects.filter(
                    session_id=session_id, 
                    user__isnull=True
                ).select_related('product')
            
            serializer = FavoriteListSerializer(favorites, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FavoritesAddView(APIView):
    """
    Добавление товара в избранное
    Поддерживает как зарегистрированных пользователей, так и гостей
    """
    permission_classes = [IsAuthenticatedOrHasSession]
    
    def get_session_id(self, request):
        """Получает session_id из заголовков или создает новый"""
        session_id = request.META.get('HTTP_X_SESSION_ID')
        if not session_id:
            session_id = request.session.session_key
            if not session_id:
                request.session.create()
                session_id = request.session.session_key
        return session_id
    
    def post(self, request):
        """Добавить товар в избранное"""
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(uuid=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Товар не найден'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            if request.user.is_authenticated:
                favorite, created = Favorite.objects.get_or_create(
                    user=request.user,
                    product=product,
                    defaults={'session_id': None}
                )
            else:
                session_id = self.get_session_id(request)
                favorite, created = Favorite.objects.get_or_create(
                    session_id=session_id,
                    product=product,
                    defaults={'user': None}
                )
            
            if created:
                return Response(
                    {'message': 'Товар добавлен в избранное'}, 
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {'message': 'Товар уже в избранном'}, 
                    status=status.HTTP_200_OK
                )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FavoritesRemoveView(APIView):
    """
    Удаление товара из избранного
    Поддерживает как зарегистрированных пользователей, так и гостей
    """
    permission_classes = [IsAuthenticatedOrHasSession]
    
    def get_session_id(self, request):
        """Получает session_id из заголовков или создает новый"""
        session_id = request.META.get('HTTP_X_SESSION_ID')
        if not session_id:
            session_id = request.session.session_key
            if not session_id:
                request.session.create()
                session_id = request.session.session_key
        return session_id
    
    def post(self, request):
        """Удалить товар из избранного"""
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(uuid=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Товар не найден'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            if request.user.is_authenticated:
                favorite = Favorite.objects.filter(
                    user=request.user,
                    product=product
                ).first()
            else:
                session_id = self.get_session_id(request)
                favorite = Favorite.objects.filter(
                    session_id=session_id,
                    product=product,
                    user__isnull=True
                ).first()
            
            if favorite:
                favorite.delete()
                return Response(
                    {'message': 'Товар удален из избранного'}, 
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'message': 'Товар не был в избранном'}, 
                    status=status.HTTP_200_OK
                )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FavoritesCountView(APIView):
    """
    Получение количества избранных товаров
    Поддерживает как зарегистрированных пользователей, так и гостей
    """
    permission_classes = [IsAuthenticatedOrHasSession]
    
    def get_session_id(self, request):
        """Получает session_id из заголовков или создает новый"""
        session_id = request.META.get('HTTP_X_SESSION_ID')
        if not session_id:
            session_id = request.session.session_key
            if not session_id:
                request.session.create()
                session_id = request.session.session_key
        return session_id
    
    def get(self, request):
        """Получить количество избранных товаров"""
        try:
            if request.user.is_authenticated:
                count = Favorite.objects.filter(user=request.user).count()
            else:
                session_id = self.get_session_id(request)
                count = Favorite.objects.filter(
                    session_id=session_id, 
                    user__isnull=True
                ).count()
            
            return Response({'count': count})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
