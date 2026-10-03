import React from "react";

export type Personagem = {
	id?: string | number;
	nome?: string;
	imagem?: string;
	[key: string]: unknown;
};

type UsePersonagemOptions = {
	url?: string;
	id?: string | number; 
	urlBase?: string;
	enabled?: boolean;
};

export const usePersonagem = ({
	url,
	id,
	urlBase = "http://localhost:3000/personagens",
	enabled = true,
}: UsePersonagemOptions) => {
	const [data, setData] = React.useState<Personagem | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const buildUrl = React.useCallback(() => {
		if (url) return url;
		if (id !== undefined && id !== null) return `${urlBase}/${id}`;
		return null;
	}, [url, id, urlBase]);

	const fetchPersonagem = React.useCallback(async (forceUrl?: string): Promise<Personagem | undefined> => {
		const fetchUrl = forceUrl ?? buildUrl();
		if (!fetchUrl) {
			setData(null);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(fetchUrl);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const json = await res.json();
			setData(json as Personagem);
			return json as Personagem;
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			setError(message);
			setData(null);
			throw err;
		} finally {
			setLoading(false);
		}
	}, [buildUrl]);

	React.useEffect(() => {
		if (!enabled) return;
		const currentUrl = buildUrl();
		if (!currentUrl) {
			queueMicrotask(() => {
				setData(null);
				setError(null);
				setLoading(false);
			});
			return;
		}

		if (typeof window !== 'undefined') console.debug('[usePersonagem] fetch url:', currentUrl);
		let mounted = true;
		queueMicrotask(() => {
			if (!mounted) return;
			fetchPersonagem().catch(() => {});
		});
		return () => {
			mounted = false;
		};
	}, [buildUrl, enabled, fetchPersonagem]);

	return {
		data,
		loading,
		error,
		refetch: fetchPersonagem,
	} as const;
};

export default usePersonagem;