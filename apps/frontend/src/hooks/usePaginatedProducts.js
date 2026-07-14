import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Постраничная подгрузка товаров для каталога.
 * fetchPage(page) → { results, count, next }
 */
export default function usePaginatedProducts(fetchPage, deps = []) {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const lockRef = useRef(false);
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  useEffect(() => {
    let cancelled = false;

    const loadFirstPage = async () => {
      setLoading(true);
      setError(null);
      setProducts([]);
      setCount(0);
      setPage(1);
      setHasMore(false);
      lockRef.current = false;

      try {
        const data = await fetchPageRef.current(1);
        if (cancelled) return;
        setProducts(data.results || []);
        setCount(data.count ?? 0);
        setHasMore(Boolean(data.next));
        setPage(1);
      } catch (err) {
        console.error('Paginated products load error:', err);
        if (!cancelled) {
          setError(err);
          setProducts([]);
          setCount(0);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFirstPage();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps provided by caller
  }, deps);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || loadingMore || lockRef.current) {
      return;
    }

    lockRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const data = await fetchPageRef.current(nextPage);
      setProducts((prev) => {
        const seen = new Set(prev.map((item) => item.uuid));
        const appended = (data.results || []).filter((item) => !seen.has(item.uuid));
        return [...prev, ...appended];
      });
      setCount(data.count ?? 0);
      setHasMore(Boolean(data.next));
      setPage(nextPage);
    } catch (err) {
      console.error('Paginated products load more error:', err);
    } finally {
      setLoadingMore(false);
      lockRef.current = false;
    }
  }, [hasMore, loading, loadingMore, page]);

  return {
    products,
    count,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
  };
}
