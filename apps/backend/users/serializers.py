from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from pages.consent import CONSENT_REQUIRED_MESSAGE
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
    personal_data_consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = (
            'email', 'password', 'password2', 'first_name', 'last_name',
            'phone', 'personal_data_consent',
        )
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone': {'required': False}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Пароли не совпадают"})
        if not data.get('personal_data_consent'):
            raise serializers.ValidationError({
                'personal_data_consent': CONSENT_REQUIRED_MESSAGE,
            })
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data.pop('personal_data_consent')
        user = User.objects.create_user(**validated_data)
        user.personal_data_consent_at = timezone.now()
        user.save(update_fields=['personal_data_consent_at'])
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