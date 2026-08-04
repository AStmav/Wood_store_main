import { Component } from 'react';
import ErrorMessage from './ErrorMessage.jsx';

/**
 * Ловит падения React (в т.ч. ошибку загрузки lazy-чанков).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const chunkFailed =
        this.state.error?.name === 'ChunkLoadError' ||
        /Loading chunk|Failed to fetch dynamically imported module/i.test(
          String(this.state.error?.message || ''),
        );

      return (
        <ErrorMessage
          fullPage
          variant="unavailable"
          title={chunkFailed ? 'Не удалось загрузить страницу' : 'Сервис временно недоступен'}
          message={
            chunkFailed
              ? 'Обновите страницу — возможно, вышла новая версия сайта.'
              : 'Произошёл сбой в работе интерфейса. Обновите страницу или зайдите позже.'
          }
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
