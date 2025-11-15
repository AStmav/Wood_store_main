from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Сериализатор для просмотра и обновления данных пользователя
    """
    class Meta:
        model = User
        fields = ('uuid', 'email', 'first_name', 'last_name', 'phone', 'is_active', 'is_staff')
        read_only_fields = ('uuid', 'email', 'is_staff')


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для создания нового пользователя
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 'phone')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone': {'required': False}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Пароли не совпадают"})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Кастомный сериализатор для получения токена с использованием email
    """
    username_field = 'email'


class ChangePasswordSerializer(serializers.Serializer):
    """
    Сериализатор для изменения пароля
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({"new_password2": "Пароли не совпадают"})
        return data