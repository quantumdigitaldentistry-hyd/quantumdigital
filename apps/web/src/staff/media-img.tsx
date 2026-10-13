import { useEffect, useState, type ImgHTMLAttributes } from 'react';

import { mediaUrl } from './upload';

/** An <img> for a stored media path: fetches a signed link, then shows the image. */
export function MediaImg({
  path,
  ...rest
}: { path: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let live = true;
    void mediaUrl(path).then((url) => live && setSrc(url));
    return () => {
      live = false;
    };
  }, [path]);
  return src ? <img src={src} {...rest} /> : <span aria-hidden className={rest.className} />;
}
