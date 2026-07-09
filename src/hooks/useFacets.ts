import { useEffect, useState } from 'react';
import { apiFetch } from '../config/apiClient';
import API_BASE_URL from '../config/api';

interface Facets {
    types: string[];
    colors: string[];
    sizes: string[];
    priceMin: number;
    priceMax: number;
}

interface FacetScope {
    category?: string;
    filter?: string;
    q?: string;
}

const EMPTY: Facets = { types: [], colors: [], sizes: [], priceMin: 0, priceMax: 0 };

export function useFacets(scope: FacetScope) {
    const [facets, setFacets] = useState<Facets>(EMPTY);

    useEffect(() => {
        const params = new URLSearchParams();
        if (scope.category) params.set('category', scope.category);
        if (scope.filter) params.set('filter', scope.filter);
        if (scope.q) params.set('q', scope.q);

        let cancelled = false;
        apiFetch(`${API_BASE_URL}/api/products/facets?${params}`)
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                setFacets({
                    types: data.types || [],
                    colors: data.colors || [],
                    sizes: data.sizes || [],
                    priceMin: Number(data.priceMin) || 0,
                    priceMax: Number(data.priceMax) || 0
                });
            })
            .catch(() => {
                if (!cancelled) setFacets(EMPTY);
            });

        return () => {
            cancelled = true;
        };
    }, [scope.category, scope.filter, scope.q]);

    return facets;
}

export default useFacets;
