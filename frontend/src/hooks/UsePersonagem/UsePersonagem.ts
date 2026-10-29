import React from "react";
import {
	personagemService,
	type Personagem,
} from '../../services/personagem.service';
import { getApiBaseUrl } from '../../utils/apiUrl';

const DEFAULT_API_URL = getApiBaseUrl();

type UsePersonagemOptions = {
	url?: string;
	id?: string | number; 
	urlBase?: string;
	enabled?: boolean;
};

export const usePersonagem = ({
	url,
	id,
	urlBase = `${DEFAULT_API_URL}/personagens`,
	enabled = true,
}: UsePersonagemOptions) => {
	const [data, setData] = React.useState<Personagem | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const requestVersion = React.useRef(0);

	const fetchPersonagem = React.useCallback(async (forceUrl?: string): Promise<Personagem | undefined> => {
		const requestId = ++requestVersion.current;
		const requestUrl = forceUrl ?? url;
		if (!requestUrl && (id === undefined || id === null)) {
			setData(null);
			setError(null);
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			let personagem: Personagem;
			if (requestUrl) {
				personagem = await personagemService.buscarPersonagemPorUrl(requestUrl);
			} else if (id !== undefined && id !== null) {
				personagem = await personagemService.listarPersonagensPorId(id, urlBase);
			} else {
				setData(null);
				return;
			}
			if (requestId === requestVersion.current) {
				setData(personagem);
			}
			return personagem;
		} catch (err: unknown) {
			if (requestId === requestVersion.current) {
				const message = err instanceof Error ? err.message : String(err);
				setError(message);
				setData(null);
			}
			throw err;
		} finally {
			if (requestId === requestVersion.current) {
				setLoading(false);
			}
		}
	}, [id, url, urlBase]);

	React.useEffect(() => {
		if (!enabled) return;
		if (!url && (id === undefined || id === null)) {
			queueMicrotask(() => {
				setData(null);
				setError(null);
				setLoading(false);
			});
			return;
		}

		let mounted = true;
		queueMicrotask(() => {
			if (!mounted) return;
			fetchPersonagem().catch(() => {});
		});
		return () => {
			mounted = false;
			requestVersion.current += 1;
		};
	}, [enabled, fetchPersonagem, id, url]);

	return {
		data,
		loading,
		error,
		refetch: fetchPersonagem,
	} as const;
};

export default usePersonagem;