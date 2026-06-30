"""Проверка согласия на обработку персональных данных в формах."""

CONSENT_FIELD = 'personal_data_consent'
CONSENT_REQUIRED_MESSAGE = (
    'Отметьте согласие на обработку персональных данных, чтобы отправить заявку.'
)

_CONSENT_TRUTHY = frozenset({'on', '1', 'true', 'yes'})


def is_personal_data_consent_given(data) -> bool:
    """Проверяет, отмечен ли чекбокс согласия в POST/JSON данных."""
    if data is None:
        return False
    value = data.get(CONSENT_FIELD)
    if value is True:
        return True
    if value is False or value is None:
        return False
    return str(value).strip().lower() in _CONSENT_TRUTHY
