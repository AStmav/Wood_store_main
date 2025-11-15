def create_user_service(email, password=None, **extra_fields):
    from .models import User
    user = User(email=email, **extra_fields)
    user.set_password(password)
    user.save()
    return user 