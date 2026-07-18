import { IUrlRepository } from './interfaces/repository/url.repository.interface';
import { UrlRepository } from './repositories/url.repository';
import { IUrlService } from './interfaces/services/url.service.interface';
import { UrlService } from './services/url.service';

export const urlProviders = [
  {
    provide: IUrlRepository,
    useClass: UrlRepository,
  },
  {
    provide: IUrlService,
    useClass: UrlService,
  },
];
