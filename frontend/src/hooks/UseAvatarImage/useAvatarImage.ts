import { useState } from 'react';

import placeholder from '../../assets/placeholder.jpg';

export const useAvatarImage = (src?: string) => {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const imageSrc = src && failedSrc !== src ? src : placeholder;
    const onError =
        imageSrc === placeholder ? undefined : () => setFailedSrc(src ?? '');

    return {
        src: imageSrc,
        onError,
    };
};
