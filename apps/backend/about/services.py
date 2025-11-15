from .models import About


class AboutService:
    """Сервис для работы с разделом 'О нас'"""

    @staticmethod
    def get_active_about():
        """Получаем активный раздел 'О нас'"""
        return About.objects.filter(is_active=True).first()
