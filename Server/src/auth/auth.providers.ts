import { IAuthRepositoryToken } from './interfaces/auth.repository.interface';
import { AuthRepository } from './repositories/auth.repository';
import { IIdentityServiceToken } from './interfaces/identity.service.interface';
import { IdentityService } from './services/identity.service';
import { IAccountServiceToken } from './interfaces/account.service.interface';
import { AccountService } from './services/account.service';

export const authProviders = [
  {
    provide: IAuthRepositoryToken,
    useClass: AuthRepository,
  },
  {
    provide: IIdentityServiceToken,
    useClass: IdentityService,
  },
  {
    provide: IAccountServiceToken,
    useClass: AccountService,
  },
];
