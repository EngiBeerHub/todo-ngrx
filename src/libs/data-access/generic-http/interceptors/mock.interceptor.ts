import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { delay, map } from 'rxjs';

export const MockInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  console.log(req);
  if (!isDevMode()) return next(req);

  const urlEnd = +req.url.split('/')[req.url.split('/').length - 1];
  const urlEndIsInteger = Number.isInteger(urlEnd);

  if (urlEndIsInteger) {
    req = req.clone({ url: req.url.split('/').slice(0, -1).join('/') });
  }

  const clonedRequest = req.clone({
    url: `assets${req.url}.json`,
    method: 'GET',
  });

  return next(clonedRequest).pipe(
    delay(500),
    map((event: HttpEvent<unknown>) => {
      const isResponse = event instanceof HttpResponse;
      if (isResponse && req.method === 'DELETE' && urlEndIsInteger)
        return event.clone({ body: { id: urlEnd } });
      if (isResponse && req.method !== 'GET')
        return event.clone({ body: req.body });
      if (isResponse && req.method === 'GET' && urlEndIsInteger)
        return event.clone({
          body: (event.body as any[]).find((item: any) => item.id === urlEnd),
        });
      return event;
    })
  );
};
