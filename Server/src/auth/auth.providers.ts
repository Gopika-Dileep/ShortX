import { IAuthRepository } from './interfaces/repository/auth.repository.interface';
import { AuthRepository } from './repositories/auth.repository';
import { IIdentityService } from './interfaces/services/identity.service.interface';
import { IdentityService } from './services/identity.service';
import { IAccountService } from './interfaces/services/account.service.interface';
import { AccountService } from './services/account.service';

export const authProviders = [
  {
    provide: IAuthRepository,
    useClass: AuthRepository,
  },
  {
    provide: IIdentityService,
    useClass: IdentityService,
  },
  {
    provide: IAccountService,
    useClass: AccountService,
  },
];
