import { container } from "tsyringe";
import './useCaseContainer'
import './controllerContainer'
import { IUserRepository } from "../../domain/repositories/IUserepository"; 
import { MongoUserRepository } from "../database/MongoUserRepository";
import { IHashService} from "../../application/services/HashService";
import { EmailService } from "../../application/services/Emailservice"; 
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import { MongoDriverRepository } from "../database/MongodriverRepository";
import { IFileStorageService } from "../../domain/services/IFileStorageService";
import { CloudinaryFileStorageService } from "../services/cloudstorageservice"; 
import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";
import { MongoVehicleRepository } from "../database/MongoVehicleRepository";
import { RedisUserRegistrationStore } from "../store/UserRegisterStore";
import { IRedisrepository } from "../../domain/repositories/IRedisrepository";
import { GoogleDistanceService } from "../../application/services/GoogleDistanceService";
import { SMSService } from "../../application/services/MSService";
import { TwilioSMSService } from "../services/TwilioSMSService";
import { IBookingRepository } from "../../domain/repositories/IBookingrepository";
import { IFareCalculatorService } from "../../application/services/FareCalculatorService";
import { MongoBookingRepository } from "../database/MongoBookingRepository";
import { FareCalculatorService } from "../services/FareCalculatorService";
import { IStripeAccountService } from "../../application/services/Accountservice";
import { StripeService } from "../services/Accountservice";
import { IStripeService } from "../../domain/services/IStripeService";
import { PaymentService } from "../services/StripeService";
import { IChatRepository } from "../../domain/repositories/IChatRepository";
import { MongoChatRepository } from "../database/ChatRepository";
import { ChatService } from "../../application/services/chatService";
import { IWalletRepository } from "../../domain/repositories/IWalletRepository";
import { MongoWalletRepository } from "../database/WalletRepository";
import { WalletService } from "../../application/services/WalletService";
import { ReferralCodeService } from "../../application/services/ReferralCodeService";
import { INotificationService } from "../../application/services/NotificationService";
import { SocketNotificationService } from "../services/SocketNotification";
import { IDriverReviewRepository } from "../../domain/repositories/IDriverReviewRepository";
import { MongoDriverReviewRepository } from "../database/MongoDriverReviewRepository";

import { IGoogleMapService } from "../../domain/services/IGoogleMapService";
import { GoogleMapService } from "../services/GoogleMapService";
import { TOKENS } from "../../constants/Tokens";
import { BcryptHashService } from "../services/Hashservice";

// Register repositories
container.registerSingleton<IUserRepository>(TOKENS.IUSER_REPO,  MongoUserRepository );
container.registerSingleton<IDriverRepository>(TOKENS.IDRIVER_REPO,MongoDriverRepository )
container.registerSingleton<IVehicleRepository>(TOKENS.VEHICLE_REPO,MongoVehicleRepository)
container.registerSingleton<IBookingRepository>(TOKENS.IBOOKING_REPO, MongoBookingRepository);
// Register servicesimplements 
container.registerSingleton<IHashService>(TOKENS.HASH_SERVICE,BcryptHashService );
container.registerSingleton<EmailService>(TOKENS.EMAIL_SERVICE,  EmailService );
container.registerSingleton<WalletService >(TOKENS.WALLET_SERVICE, WalletService );
container.register(TOKENS.REFERAL_CODE_SERVICE, {
  useClass: ReferralCodeService,
});


container.registerSingleton<IFileStorageService>(TOKENS.FILE_SERVICE,  CloudinaryFileStorageService)

container.registerSingleton<IRedisrepository>(
         TOKENS.USER_REGISTERSTORE,
    RedisUserRegistrationStore
  );
  container.registerSingleton<GoogleDistanceService>(TOKENS.GOOGLE_DISTANCE_SERVICE, GoogleDistanceService);
  container.register<SMSService>("SMSService", { useClass: TwilioSMSService });


  container.registerSingleton<IFareCalculatorService>(TOKENS.IFARE_CALCULATE_SERVICE,
   FareCalculatorService,
  );

  container.register<IStripeAccountService>(TOKENS.STRIPE_SERVICE, {
    useClass: StripeService,
  });
  container.registerSingleton<IStripeService>(TOKENS.PAYMENT_SERVICE,
   PaymentService
  );
  container.registerSingleton<IChatRepository>(TOKENS.CHAT_REPO, 
    MongoChatRepository,
  );
  container.registerSingleton<ChatService>(ChatService);

  //wallet service
  container.registerSingleton<IWalletRepository>(TOKENS.WALLET_REPO,
    MongoWalletRepository,  
  );

  container.registerSingleton<INotificationService>(TOKENS.NOTIFICATION_SERVICE,
    SocketNotificationService,
  );

  //user rate Driver
  container.registerSingleton<IDriverReviewRepository>(
  TOKENS.DRIVER_REVIEW_REPO,
  MongoDriverReviewRepository
);
 

container.register<IGoogleMapService>('IGoogleMapService', {
  useClass: GoogleMapService,
});

