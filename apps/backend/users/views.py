from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, UserCreateSerializer, ChangePasswordSerializer, MyTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .models import User


from rest_framework.throttling import AnonRateThrottle

class AuthThrottle(AnonRateThrottle):
    """Throttle для эндпоинтов аутентификации"""
    rate = '10/minute'  # 10 попыток в минуту

class MyTokenObtainPairView(TokenObtainPairView):
    """
    Кастомный view для получения токена с использованием email
    """
    serializer_class = MyTokenObtainPairSerializer
    throttle_classes = [AuthThrottle]


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления пользователями.
    
    Доступные действия:
    - create: Создание нового пользователя (доступно всем)
    - list: Получение списка пользователей (только для админов)
    - retrieve: Получение информации о пользователе (только для админов)
    - update: Обновление пользователя (только для админов)
    - partial_update: Частичное обновление пользователя (только для админов)
    - destroy: Удаление пользователя (только для админов)
    - me: Получение информации о текущем пользователе
    - change_password: Изменение пароля текущего пользователя
    - update_profile: Обновление профиля текущего пользователя
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def get_serializer_class(self):
        """
        Возвращает соответствующий сериализатор в зависимости от действия
        """
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        """
        Настраивает права доступа в зависимости от действия
        """
        if self.action in ['create', 'list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """
        Возвращает queryset в зависимости от прав пользователя
        """
        if getattr(self, 'swagger_fake_view', False):
            return User.objects.none()
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(uuid=self.request.user.uuid)

    @action(detail=False, methods=['get', 'put'])
    def me(self, request):
        """
        Получение и обновление информации о текущем пользователе
        """
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """
        Изменение пароля текущего пользователя
        
        Требуемые поля:
        - old_password: текущий пароль
        - new_password: новый пароль
        - new_password2: подтверждение нового пароля
        """
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if user.check_password(serializer.validated_data['old_password']):
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                return Response(
                    {"message": "Пароль успешно изменен"},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Неверный текущий пароль"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def update_profile(self, request):
        """
        Обновление профиля текущего пользователя
        
        Доступные поля для обновления:
        - first_name
        - last_name
        """
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        """
        Создание нового пользователя
        
        Требуемые поля:
        - email
        - password
        - password2
        - first_name (опционально)
        - last_name (опционально)
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
