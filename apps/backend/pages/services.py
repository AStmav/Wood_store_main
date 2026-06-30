from .models import Page


class PageService:
    @staticmethod
    def get_active_page_by_slug(slug: str) -> Page | None:
        return Page.objects.filter(slug=slug, is_active=True).first()
