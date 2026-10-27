"""Single source of truth for the A6 pattern records.

build_dataset.py turns these records into data/patterns.csv, data/patterns_evolution.csv
and data/pattern_counts.csv so that counts can never drift from the rows.
Paths are relative to the A6 team folder.
"""

B = "Part1/code/src/"   # baseline source
E = "Part2/code/src/"   # evolved source (final snapshot)

# ---------------------------------------------------------------------------
# Baseline (Original code) - 16 confirmed instances, 10 pattern types
# ---------------------------------------------------------------------------
BASELINE = [
    dict(
        pattern_name="Layered Architecture",
        pattern_type="Architectural",
        instance_name="Ride Booking Request Flow",
        participant_roles=(
            "PresentationLayer=BookingRoute router + BookingController.bookDriver; "
            "ApplicationLayer=BookDriver use case (IBookDriverUseCase); "
            "DomainLayer=Booking entity + IBookingRepository/IDriverRepository ports; "
            "InfrastructureLayer=MongoBookingRepository/MongoDriverRepository + BookingModel"),
        source_locations=(
            B + "presentation/routes/BookingRoute.ts:10-17; "
            + B + "presentation/controllers/BookingController.ts:78-94; "
            + B + "application/use_cases/User/BookDriver.ts:27-142; "
            + B + "domain/models/Booking.ts:20-47; "
            + B + "domain/repositories/IBookingrepository.ts:23-62; "
            + B + "infrastructure/database/MongoBookingRepository.ts:12-24"),
        intent_and_evidence=(
            "Separates HTTP handling, business rules and persistence. The route only wires middleware to "
            "BookingController.bookDriver; the controller validates the DTO and calls _bookDriverUseCase.execute; "
            "BookDriver depends only on domain interfaces (IBookingRepository, IDriverRepository, "
            "INotificationService) and never on Express; the Mongo implementations live in infrastructure. "
            "Dependencies point inward except the noted AcceptBooking violation (see rejected/uncertain notes)."),
    ),
    dict(
        pattern_name="Dependency Injection",
        pattern_type="Architectural (framework idiom - tsyringe IoC container)",
        instance_name="Use-Case and Service Composition Root",
        participant_roles=(
            "Injector/Container=tsyringe container; CompositionRoot=container.ts + useCaseContainer.ts + "
            "controllerContainer.ts; Tokens=TOKENS/USECASE_TOKENS symbols; "
            "Client=BookDriver (constructor @inject of 5 abstractions); "
            "Services=MongoBookingRepository, MongoDriverRepository, FareCalculatorService, "
            "SocketNotificationService, GoogleDistanceService; Resolver=BookingRoute (container.resolve)"),
        source_locations=(
            B + "index.ts:1-6; "
            + B + "infrastructure/config/container.ts:44-101; "
            + B + "infrastructure/config/useCaseContainer.ts:168-199; "
            + B + "infrastructure/config/controllerContainer.ts:10-14; "
            + B + "constants/Tokens.ts:2-43; "
            + B + "application/use_cases/User/BookDriver.ts:27-35; "
            + B + "presentation/routes/BookingRoute.ts:11-12"),
        intent_and_evidence=(
            "Objects do not construct their collaborators. container.ts binds each symbol token to an "
            "implementation (e.g. TOKENS.IBOOKING_REPO -> MongoBookingRepository, TOKENS.NOTIFICATION_SERVICE -> "
            "SocketNotificationService); BookDriver declares @inject(TOKENS.X) constructor parameters typed by "
            "interfaces; routes obtain fully wired controllers with container.resolve. index.ts imports the "
            "container modules before any route so registrations exist at resolve time."),
    ),
    dict(
        pattern_name="Singleton",
        pattern_type="Creational",
        instance_name="Shared Socket.IO Server Instance",
        participant_roles=(
            "Singleton=module-scoped variable io in socket.ts (no class; module plays the Singleton role); "
            "Initializer=initializeSocket(server); GlobalAccessPoint=getIO(); "
            "Clients=SocketNotificationService.io getter, NotificationSocket, index.ts"),
        source_locations=(
            B + "infrastructure/socket/socket.ts:9-16; "
            + B + "infrastructure/socket/socket.ts:181-184; "
            + B + "infrastructure/services/SocketNotification.ts:8-10; "
            + B + "infrastructure/socket/SocketNotification.ts:13-14; "
            + B + "index.ts:55-60"),
        intent_and_evidence=(
            "Exactly one Socket.IO server must exist for the HTTP server. initializeSocket assigns the single "
            "module-level io once at start-up; every consumer obtains that same instance through getIO(), which "
            "throws if it is not initialised. SocketNotificationService uses a lazy getter so the instance is "
            "fetched only after initialisation. No class with a private constructor exists - the ES module "
            "cache provides the single instance."),
    ),
    dict(
        pattern_name="Repository",
        pattern_type="Enterprise (PoEAA) / Domain-Driven Design",
        instance_name="Trip Booking Repository",
        participant_roles=(
            "Repository=IBookingRepository; LayerSupertype=IBaseRepository + BaseRepository<T,U>; "
            "ConcreteRepository=MongoBookingRepository; Entity=Booking; PersistenceModel=BookingModel; "
            "Clients=BookDriver, CancelBookingInputUseCase, UpdateBookingStatus, AttachPaymentIntentIdToBooking"),
        source_locations=(
            B + "domain/repositories/IBookingrepository.ts:23-62; "
            + B + "domain/repositories/IBaseRepository.ts:1-8; "
            + B + "infrastructure/database/BaseRepository.ts:5-41; "
            + B + "infrastructure/database/MongoBookingRepository.ts:12-516; "
            + B + "domain/models/Booking.ts:20-47; "
            + B + "infrastructure/database/modals/Bookingschema.ts:4-54; "
            + B + "application/use_cases/User/BookDriver.ts:30,46,118; "
            + B + "application/use_cases/User/CancelBooking.ts:22-23,29,48-51"),
        intent_and_evidence=(
            "Trip use cases see a collection-like domain interface (createBooking, findBookingById, updateBooking, "
            "checkDriverAvailability) instead of Mongoose. MongoBookingRepository extends BaseRepository and maps "
            "calls onto BookingModel queries/aggregations; BookDriver and CancelBooking receive it through "
            "@inject(TOKENS.IBOOKING_REPO)."),
    ),
    dict(
        pattern_name="Repository",
        pattern_type="Enterprise (PoEAA) / Domain-Driven Design",
        instance_name="Driver Repository with Geospatial Matching Query",
        participant_roles=(
            "Repository=IDriverRepository; LayerSupertype=BaseRepository<T,U>; ConcreteRepository=MongoDriverRepository; "
            "Entity=Driver; PersistenceModel=DriverModel (2dsphere index); "
            "Clients=BookDriver.findNearbyDriversWithinRadius, FindNearbyDrivers.findActiveDrivers, "
            "AdminChangeDriverStatus.updateStatus, CreatePaymentIntent.findDriverById"),
        source_locations=(
            B + "domain/repositories/IDriverepository.ts:4-27; "
            + B + "infrastructure/database/MongodriverRepository.ts:13-289; "
            + B + "infrastructure/database/MongodriverRepository.ts:243-287; "
            + B + "domain/models/Driver.ts:3-37; "
            + B + "infrastructure/database/modals/Driverschema.ts:4-74; "
            + B + "application/use_cases/User/BookDriver.ts:64-68; "
            + B + "application/use_cases/Admin/AdminChangeDriverStatus.ts:33"),
        intent_and_evidence=(
            "Driver matching asks the repository for drivers within a radius; MongoDriverRepository hides the "
            "$geoNear aggregation (approved, unblocked, activePayment drivers) behind "
            "findNearbyDriversWithinRadius. Status changes go through updateStatus. Clients depend on the interface "
            "via @inject(TOKENS.IDRIVER_REPO)."),
    ),
    dict(
        pattern_name="Repository",
        pattern_type="Enterprise (PoEAA) / Domain-Driven Design",
        instance_name="Rider Repository",
        participant_roles=(
            "Repository=IUserRepository; LayerSupertype=BaseRepository<T,U>; ConcreteRepository=MongoUserRepository; "
            "Entity=User; PersistenceModel=UserModel (userschema); "
            "Clients=FindNearbyDrivers (rider location), CheckBlockedUserOrDriver, AttachPaymentIntentIdToBooking"),
        source_locations=(
            B + "domain/repositories/IUserepository.ts:3-12; "
            + B + "infrastructure/database/MongoUserRepository.ts:13-150; "
            + B + "domain/models/User.ts:3-26; "
            + B + "infrastructure/database/modals/userschema.ts:4-45; "
            + B + "application/use_cases/User/FindNearbyDrivers.ts:17,27; "
            + B + "middleware/checkBlocked.ts:13,38"),
        intent_and_evidence=(
            "Rider data (location used for matching, block flag used by middleware) is read through "
            "IUserRepository.getUserById; the Mongo implementation extends BaseRepository. Clients never touch "
            "UserModel directly."),
    ),
    dict(
        pattern_name="Repository",
        pattern_type="Enterprise (PoEAA) / Domain-Driven Design",
        instance_name="Rider Wallet Ledger Repository",
        participant_roles=(
            "Repository=IWalletRepository; LayerSupertype=BaseRepository<T,U>; ConcreteRepository=MongoWalletRepository; "
            "Entity=Wallet/WalletTransaction; PersistenceModel=WalletModel; "
            "Clients=AttachPaymentIntentIdToBooking (debit), WalletPayment.WalletRidePayment (debit), WalletService"),
        source_locations=(
            B + "domain/repositories/IWalletRepository.ts:3-10; "
            + B + "infrastructure/database/WalletRepository.ts:13-134; "
            + B + "domain/models/Wallet.ts:3-18; "
            + B + "infrastructure/database/modals/Walletschema.ts:5-35; "
            + B + "application/use_cases/User/AttachPaymentIntentIdToBooking.ts:20,35-42; "
            + B + "application/use_cases/User/WalletRidePayment.ts:16,53-57"),
        intent_and_evidence=(
            "Ride payment use cases credit/debit the rider wallet through creditAmount/debitAmount on the "
            "interface; MongoWalletRepository keeps the transaction list consistent in MongoDB."),
    ),
    dict(
        pattern_name="Repository",
        pattern_type="Enterprise (PoEAA) / Domain-Driven Design",
        instance_name="Driver Review Repository",
        participant_roles=(
            "Repository=IDriverReviewRepository; LayerSupertype=BaseRepository<T,U>; "
            "ConcreteRepository=MongoDriverReviewRepository; Entity=DriverReview; PersistenceModel=ReviewModel; "
            "Clients=SubmitDriverReview, GetDriverReviews"),
        source_locations=(
            B + "domain/repositories/IDriverReviewRepository.ts:8-12; "
            + B + "infrastructure/database/MongoDriverReviewRepository.ts:11-53; "
            + B + "domain/models/DriverReview.ts:1-14; "
            + B + "application/use_cases/User/SubmitRating.ts:12-17,22,27; "
            + B + "application/use_cases/Driver/DriverReview.ts:7-14"),
        intent_and_evidence=(
            "Driver ratings are stored and queried through IDriverReviewRepository (createReview, "
            "hasUserAlreadyReviewed, getReviewsByDriverId); the use cases rely only on that interface."),
    ),
    dict(
        pattern_name="Data Mapper",
        pattern_type="Enterprise (PoEAA)",
        instance_name="Driver Review Persistence Mapping",
        participant_roles=(
            "Mapper=DriverReviewMapper.toDomain / toPersistence (functions, no class); DomainObject=DriverReview; "
            "PersistenceRecord=ReviewDocument; Client=MongoDriverReviewRepository"),
        source_locations=(
            B + "infrastructure/database/mappers/DriverReviewMapper.ts:6-28; "
            + B + "domain/models/DriverReview.ts:1-14; "
            + B + "infrastructure/database/modals/DriverReviewschema.ts:4-22; "
            + B + "infrastructure/database/MongoDriverReviewRepository.ts:17-19,45"),
        intent_and_evidence=(
            "Keeps the domain object free of Mongoose types: toPersistence converts string ids to ObjectId before "
            "save and toDomain converts the stored document (and populated user) back to a plain DriverReview. "
            "The repository calls toPersistence before create and maps every query result with toDomain."),
    ),
    dict(
        pattern_name="Adapter",
        pattern_type="Structural",
        instance_name="Socket.IO Ride Notification Adapter",
        participant_roles=(
            "Target=INotificationService; Adapter=SocketNotificationService; "
            "Adaptee=Socket.IO Server (getIO) + Upstash Redis socket registry (redis.get driver:socket:<id>); "
            "Clients=BookDriver, AcceptBooking, CancelBookingInputUseCase, UpdateBookingStatus, "
            "AdminChangeDriverStatus, AttachPaymentIntentIdToBooking, CronScheduler"),
        source_locations=(
            B + "application/services/NotificationService.ts:2-16; "
            + B + "infrastructure/services/SocketNotification.ts:6-72; "
            + B + "infrastructure/socket/socket.ts:181-184; "
            + B + "config/redisconfig.ts:6-9; "
            + B + "infrastructure/config/container.ts:88-90; "
            + B + "application/use_cases/User/BookDriver.ts:120-138; "
            + B + "application/use_cases/User/CancelBooking.ts:52-54"),
        intent_and_evidence=(
            "Use cases speak a domain vocabulary (sendBookingNotification, cancelBookingNotification, "
            "paymentNotification...). SocketNotificationService translates each call into a Redis lookup of the "
            "recipient socket id followed by io.to(socketId).emit('<event>', data), so use cases never import "
            "Socket.IO or Redis."),
    ),
    dict(
        pattern_name="Adapter",
        pattern_type="Structural",
        instance_name="Stripe Ride Payment Adapter",
        participant_roles=(
            "Target=IStripeService; Adapter=PaymentService; Adaptee=Stripe SDK client (paymentIntents, transfers, "
            "balance); Clients=CreatePaymentIntent, AttachPaymentIntentIdToBooking, WalletPayment"),
        source_locations=(
            B + "domain/services/IStripeService.ts:3-22; "
            + B + "infrastructure/services/StripeService.ts:8-91; "
            + B + "infrastructure/config/container.ts:75-77; "
            + B + "application/use_cases/User/CreatePaymentIntent.ts:11-39; "
            + B + "application/use_cases/User/AttachPaymentIntentIdToBooking.ts:22-23,51-56; "
            + B + "application/use_cases/User/WalletRidePayment.ts:19-20,47-51"),
        intent_and_evidence=(
            "The domain-level interface expresses ride payments (createPaymentIntent with platformFee, "
            "transferToDriverFromWallet). PaymentService converts those calls into Stripe API calls "
            "(paymentIntents.create with application_fee_amount and transfer_data, transfers.create in paisa)."),
    ),
    dict(
        pattern_name="Adapter",
        pattern_type="Structural",
        instance_name="Stripe Connect Driver Payout Onboarding Adapter",
        participant_roles=(
            "Target=IStripeAccountService; Adapter=StripeService (Accountservice.ts); "
            "Adaptee=module-level Stripe SDK client (accounts, accountLinks); "
            "Clients=OnboardDriverUseCase, VerifyDriverPaymentAccount"),
        source_locations=(
            B + "application/services/Accountservice.ts:3-7; "
            + B + "infrastructure/services/Accountservice.ts:7-60; "
            + B + "infrastructure/config/container.ts:72-74; "
            + B + "application/use_cases/Driver/DriverOnboarding.ts:7-20; "
            + B + "application/use_cases/Driver/VerifyAccountStatus.ts:11-23"),
        intent_and_evidence=(
            "Driver payout onboarding needs 'create account', 'create onboarding link' and 'retrieve account'. "
            "StripeService implements those three operations by calling stripe.accounts.create (express), "
            "stripe.accountLinks.create and stripe.accounts.retrieve."),
    ),
    dict(
        pattern_name="Gateway",
        pattern_type="Enterprise (PoEAA)",
        instance_name="Google Distance Matrix Location Gateway",
        participant_roles=(
            "Gateway=GoogleDistanceService.getDistances (concrete class, no interface); "
            "ExternalResource=Google Distance Matrix REST API via axios; "
            "Clients=BookDriver (road-distance filter <= 20 km), FindNearbyDrivers (sort by distance), "
            "NotificationSocket driver:online catch-up"),
        source_locations=(
            B + "application/services/GoogleDistanceService.ts:4-45; "
            + B + "infrastructure/config/container.ts:64; "
            + B + "application/use_cases/User/BookDriver.ts:71-93; "
            + B + "application/use_cases/User/FindNearbyDrivers.ts:67-72; "
            + B + "infrastructure/socket/SocketNotification.ts:45-62"),
        intent_and_evidence=(
            "All road-distance lookups go through one object that builds the origins/destinations query, calls the "
            "API and returns a Record<driverOrBookingId, km>. Callers never see HTTP details. It is a Gateway "
            "rather than an Adapter because there is no separate target interface; clients inject the concrete "
            "class."),
    ),
    dict(
        pattern_name="Observer",
        pattern_type="Behavioral",
        instance_name="Ride Event Notification",
        participant_roles=(
            "Subject=SocketNotificationService over the Socket.IO server (subject role combined, not separately "
            "declared); SubscriberRegistry=Redis keys driver:socket:<id>/user:socket:<id>; "
            "Subscribe=NotificationSocket driver:online/user:online handlers; Unsubscribe=disconnect handler; "
            "Notify=io.to(socketId).emit(event); "
            "ConcreteObservers=connected rider/driver Socket.IO clients (outside this repository)"),
        source_locations=(
            B + "infrastructure/socket/SocketNotification.ts:16-20; "
            + B + "infrastructure/socket/SocketNotification.ts:85-106; "
            + B + "infrastructure/services/SocketNotification.ts:11-26; "
            + B + "infrastructure/services/SocketNotification.ts:27-70; "
            + B + "application/use_cases/Driver/AcceptBooking.ts:37-50"),
        intent_and_evidence=(
            "Riders and drivers register interest when their client emits driver:online/user:online (socket id "
            "stored in Redis) and are removed on disconnect. When a trip event happens (new booking, acceptance, "
            "cancellation, payment) the subject pushes it to every registered recipient with emit; "
            "broadcastBookingNotification loops over nearby driver ids and silently skips drivers with no socket. "
            "Publishers do not know how many observers exist."),
    ),
    dict(
        pattern_name="Chain of Responsibility",
        pattern_type="Behavioral",
        instance_name="Authenticated Ride Request Pipeline",
        participant_roles=(
            "Handler=Express middleware signature (req,res,next) (framework, not declared); "
            "ConcreteHandlers=protectRoute(roles) closure, CheckBlockedUserOrDriver.handle, "
            "catchAsync-wrapped BookingController handler, errorHandler; "
            "Client/ChainBuilder=BookingRoute, userRoutes and driverRoutes route definitions + app.use in index.ts"),
        source_locations=(
            B + "middleware/authMiddleware.ts:15-60; "
            + B + "middleware/checkBlocked.ts:10-63; "
            + B + "middleware/errorHandler.ts:12-56; "
            + B + "presentation/routes/BookingRoute.ts:14-16; "
            + B + "presentation/routes/userRoutes.ts:102-106; "
            + B + "index.ts:34-51"),
        intent_and_evidence=(
            "Each handler either ends the request (401 no token, 403 wrong role, 403 blocked account) or calls "
            "next() to pass it on; errors thrown later travel to errorHandler, which picks the response by error "
            "type. The order is assembled per route, e.g. protectRoute(['user']) -> checkBlocked -> "
            "bookingController.bookDriver."),
    ),
    dict(
        pattern_name="Decorator",
        pattern_type="Structural (function-wrapper form)",
        instance_name="Async Controller Error Forwarding",
        participant_roles=(
            "Component=Express RequestHandler interface; Decorator=catchAsync(fn) (higher-order function); "
            "ConcreteComponents=BookingController async handlers (bookDriver, cancelBooking, updateStatus...); "
            "Client=route definitions that register the wrapped handlers"),
        source_locations=(
            B + "infrastructure/utils/catchAsync.ts:7-13; "
            + B + "presentation/controllers/BookingController.ts:78-94; "
            + B + "presentation/controllers/BookingController.ts:165-181; "
            + B + "presentation/controllers/BookingController.ts:193-204"),
        intent_and_evidence=(
            "catchAsync returns a RequestHandler with the same (req,res,next) call shape as the wrapped controller "
            "function and adds one responsibility: a rejected promise is forwarded to next(err). Every "
            "BookingController action is declared as catchAsync(async ...), so error forwarding is added without "
            "modifying the handlers."),
    ),
]

# Candidates examined and NOT counted (observation scope = the seven areas listed in README).
REJECTED = [
    ("Strategy", "rejected", "FareCalculatorService: only one implementation of IFareCalculatorService; ride-type "
     "behaviour is an if/else inside calculate (infrastructure/services/FareCalculatorService.ts:20-36). An interface "
     "used for DI is not a family of interchangeable algorithms."),
    ("State", "rejected", "BookingStatus and driver status are enums/strings; transitions are scattered if-checks "
     "(CancelBooking.ts:35-51, UpdateBookingstatus.ts:36-63, AdminChangeDriverStatus.ts:24-33). No state objects."),
    ("Command", "rejected", "Use cases expose execute(), but there is no invoker storing, queuing or undoing command "
     "objects; controllers call them directly. Classified as use-case interactors inside the Layered Architecture."),
    ("Template Method", "rejected", "BaseRepository is a generic layer supertype with complete methods; it defines "
     "no algorithm skeleton with abstract/hook steps (BaseRepository.ts:5-41)."),
    ("Factory Method", "rejected", "protectRoute(allowedRoles) returns a configured closure (authMiddleware.ts:15-18); "
     "there is no creator hierarchy deciding which product class to instantiate."),
    ("Facade", "rejected", "Controllers delegate to one use case per action; they do not simplify a subsystem of "
     "several collaborating classes."),
    ("Adapter (Google Maps road distance)", "uncertain", "GoogleMapService implements IGoogleMapService "
     "(GoogleMapService.ts:8-70) and is registered (container.ts:99-101) but no class in the code injects "
     "IGoogleMapService, so no Client participant exists."),
    ("Adapter (Twilio SMS)", "uncertain", "TwilioSMSService implements SMSService (TwilioSMSService.ts:6-16) and is "
     "registered (container.ts:65) but nothing resolves 'SMSService'; dormant code."),
]

# ---------------------------------------------------------------------------
# Evolution. Line ranges for evolved rows refer to Part2/code (final snapshot, commit a12c878);
# the CH01 and CH02 snapshots are reproducible from commits f635355 and 28a83c8 or the patches.
# ---------------------------------------------------------------------------
SNAPSHOTS = ["After CH01", "After CH02", "After CH03"]

# Files touched by CH01-CH03 (git diff --name-only c8766f4 a12c878 -- src). For rows whose status is
# "preserved", line ranges inside these files are dropped because the lines moved.
CHANGED_FILES = set("""
application/services/FareCalculatorService.ts application/services/NotificationService.ts
application/use_cases/Admin/AdminChangeDriverStatus.ts application/use_cases/Admin/Interfaces/IAdminChangeDriverStatus.ts
application/use_cases/Driver/AcceptBooking.ts application/use_cases/Driver/UpdateBookingstatus.ts application/use_cases/Login.ts
application/use_cases/User/BookDriver.ts application/use_cases/User/CancelBooking.ts
application/use_cases/User/interfaces/ICancelBookingUseCase.ts constants/Routes.ts domain/models/Booking.ts domain/models/Driver.ts
domain/repositories/IBookingrepository.ts domain/repositories/IDriverepository.ts
infrastructure/database/MongoBookingRepository.ts infrastructure/database/MongodriverRepository.ts
infrastructure/database/modals/Bookingschema.ts infrastructure/database/modals/Driverschema.ts
infrastructure/services/CronScheduler.ts infrastructure/services/FareCalculatorService.ts
infrastructure/services/SocketNotification.ts infrastructure/socket/SocketNotification.ts
presentation/controllers/BookingController.ts presentation/routes/driverRoutes.ts presentation/schemas/admin/AdminRequestDTO.ts
""".split())

# (instance_name, snapshot) -> status, change description and the updated source locations
CHANGES = {
    ("Ride Booking Request Flow", "After CH01"): dict(
        status="modified",
        change="AcceptBooking no longer imports the Mongoose BookingModel (application -> infrastructure dependency removed); "
               "new domain module domain/driver holds the driver-account states.",
        source_locations=E + "presentation/routes/BookingRoute.ts:10-17; " + E + "application/use_cases/User/BookDriver.ts:29-149; "
               + E + "application/use_cases/Driver/AcceptBooking.ts:15-59; " + E + "domain/driver/DriverAccountState.ts:13-144; "
               + E + "domain/repositories/IBookingrepository.ts:23-64"),
    ("Use-Case and Service Composition Root", "After CH01"): dict(
        status="extended",
        change="AcceptBooking gains @inject(TOKENS.IDRIVER_REPO); no new registrations needed.",
        source_locations=E + "application/use_cases/Driver/AcceptBooking.ts:16-20; " + E + "infrastructure/config/container.ts:44-101"),
    ("Use-Case and Service Composition Root", "After CH03"): dict(
        status="extended",
        change="UpdateBookingStatus gains @inject(TOKENS.IFARE_CALCULATE_SERVICE).",
        source_locations=E + "application/use_cases/Driver/UpdateBookingstatus.ts:21-30; " + E + "infrastructure/config/container.ts:68-70"),
    ("Trip Booking Repository", "After CH01"): dict(
        status="extended",
        change="New repository operation acceptPendingBooking (atomic PENDING->CONFIRMED) moved out of AcceptBooking; "
               "AcceptBooking becomes a new client.",
        source_locations=E + "domain/repositories/IBookingrepository.ts:40-42; "
               + E + "infrastructure/database/MongoBookingRepository.ts:115-126; " + E + "application/use_cases/Driver/AcceptBooking.ts:34"),
    ("Trip Booking Repository", "After CH02"): dict(
        status="extended",
        change="Booking entity and schema gain cancelledBy and cancellationFee, persisted through updateBooking by CancelBookingInputUseCase.",
        source_locations=E + "domain/models/Booking.ts:47-48; " + E + "infrastructure/database/modals/Bookingschema.ts:47-48; "
               + E + "application/use_cases/User/CancelBooking.ts:38-43"),
    ("Driver Repository with Geospatial Matching Query", "After CH01"): dict(
        status="modified",
        change="updateStatus accepts DriverAccountStatus (adds suspended) and stores the suspension reason; schema enum extended. "
               "The geo query is unchanged and already excludes non-approved (suspended) drivers.",
        source_locations=E + "domain/repositories/IDriverepository.ts:10; " + E + "infrastructure/database/MongodriverRepository.ts:90-103; "
               + E + "infrastructure/database/modals/Driverschema.ts:30-34"),
    ("Socket.IO Ride Notification Adapter", "After CH02"): dict(
        status="extended",
        change="Target INotificationService gains driverCancelledBookingNotification; the adapter maps it to "
               "emit('booking:cancelledByDriver') on the rider socket.",
        source_locations=E + "application/services/NotificationService.ts:2-17; " + E + "infrastructure/services/SocketNotification.ts:35-40; "
               + E + "application/use_cases/User/CancelBooking.ts:45-54"),
    ("Ride Event Notification", "After CH01"): dict(
        status="modified",
        change="The driver:online subscription handler now skips the catch-up push for drivers whose account state cannot receive rides "
               "(pending/rejected/suspended); the admin status notification is sent only after a legal transition is saved.",
        source_locations=E + "infrastructure/socket/SocketNotification.ts:19-28; "
               + E + "application/use_cases/Admin/AdminChangeDriverStatus.ts:31-34"),
    ("Ride Event Notification", "After CH02"): dict(
        status="extended",
        change="New published event booking:cancelledByDriver to riders; cancelling an unaccepted broadcast publishes booking:assigned "
               "so drivers dismiss the request.",
        source_locations=E + "infrastructure/services/SocketNotification.ts:35-40; " + E + "application/use_cases/User/CancelBooking.ts:45-54"),
    ("Authenticated Ride Request Pipeline", "After CH02"): dict(
        status="extended",
        change="New chain for drivers: protectRoute(['driver']) -> CheckBlockedUserOrDriver.handle -> BookingController.driverCancelBooking.",
        source_locations=E + "presentation/routes/driverRoutes.ts:50-53; " + E + "presentation/controllers/BookingController.ts:193-217"),
    ("Async Controller Error Forwarding", "After CH02"): dict(
        status="extended",
        change="New ConcreteComponent driverCancelBooking wrapped by catchAsync; cancelBooking now reads the authenticated user id.",
        source_locations=E + "infrastructure/utils/catchAsync.ts:7-13; " + E + "presentation/controllers/BookingController.ts:193-217"),
}

NEW_INSTANCES = [
    ("After CH01", dict(
        pattern_name="State", pattern_type="Behavioral", instance_name="Driver Account Lifecycle",
        participant_roles=("State=DriverAccountState (+ BaseDriverAccountState default refusals); ConcreteStates=PendingDriverState, "
                           "ApprovedDriverState, RejectedDriverState, SuspendedDriverState; Context=DriverAccount; "
                           "Clients=AdminChangeDriverStatus, AcceptBooking, BookDriver, NotificationSocket driver:online handler"),
        source_locations=(E + "domain/driver/DriverAccountState.ts:13-50; " + E + "domain/driver/DriverAccountState.ts:52-92; "
                          + E + "domain/driver/DriverAccountState.ts:110-144; " + E + "application/use_cases/Admin/AdminChangeDriverStatus.ts:31; "
                          + E + "application/use_cases/Driver/AcceptBooking.ts:29; " + E + "application/use_cases/User/BookDriver.ts:48"),
        intent_and_evidence=("Each status object answers which admin actions are legal and whether the driver may take rides. "
                             "DriverAccount.changeTo maps the requested status to approve/reject/suspend/resetToPending on the current "
                             "state, which returns the next state or throws InvalidTransitionError (409). Adding SUSPENDED needed one "
                             "new class plus suspend() on ApprovedDriverState; tests: tests/driverStatus.test.ts (9 cases)."),
        status="newly_introduced",
        change=("Requirement CH01 (new driver status). Replaces the any-to-any status update validated by an array includes() in "
                "AdminChangeDriverStatus (rejected State candidate in the baseline)."))),
    ("After CH02", dict(
        pattern_name="State", pattern_type="Behavioral", instance_name="Trip Lifecycle and Cancellation",
        participant_roles=("State=TripState (+ BaseTripState default refusals); ConcreteStates=PendingTrip, ConfirmedTrip, FinishedTrip "
                           "(COMPLETED/CANCELLED/REJECTED/EXPIRED); Context=TripLifecycle; "
                           "Clients=CancelBookingInputUseCase, UpdateBookingStatus, CronScheduler"),
        source_locations=(E + "domain/booking/TripState.ts:10-75; " + E + "domain/booking/TripState.ts:97-120; "
                          + E + "application/use_cases/User/CancelBooking.ts:35; " + E + "application/use_cases/Driver/UpdateBookingstatus.ts:44; "
                          + E + "infrastructure/services/CronScheduler.ts:30"),
        intent_and_evidence=("Trip transitions are decided by the current state object: PendingTrip accepts accept/cancel/reject/expire, "
                             "ConfirmedTrip accepts complete/cancel/reject, FinishedTrip refuses everything. CancelBooking calls "
                             "apply('cancel'), UpdateBookingStatus calls moveTo(status) and CronScheduler calls apply('expire'). "
                             "Fixes the baseline defect where a COMPLETED trip could be cancelled; tests T1-T8 in tests/cancellation.test.ts."),
        status="newly_introduced",
        change="Requirement CH02 (ride cancellation). Replaces scattered status if-checks in CancelBooking and UpdateBookingStatus.")),
    ("After CH02", dict(
        pattern_name="Strategy", pattern_type="Behavioral", instance_name="Cancellation Fee Policy",
        participant_roles=("Strategy=CancellationPolicy; ConcreteStrategies=RiderCancellationPolicy, DriverCancellationPolicy; "
                           "Selector=cancellationPolicyFor(cancelledBy); Context=CancelBookingInputUseCase"),
        source_locations=(E + "domain/booking/CancellationPolicy.ts:6-9; " + E + "domain/booking/CancellationPolicy.ts:26-41; "
                          + E + "domain/booking/CancellationPolicy.ts:43-50; " + E + "application/use_cases/User/CancelBooking.ts:36"),
        intent_and_evidence=("The fee rule varies by who cancels. The rider policy is free while PENDING or before 21:00 IST the day "
                             "before the ride, else max(Rs 50, 10% of the estimated fare); the driver policy is always 0. The use case "
                             "asks cancellationPolicyFor(cancelledBy) and calls calculateFee without knowing which rule runs."),
        status="newly_introduced",
        change="Requirement CH02. The baseline cutoff rule (refuse after 21:00 IST) moved from CancelBooking into RiderCancellationPolicy "
               "and became a late fee.")),
    ("After CH03", dict(
        pattern_name="Strategy", pattern_type="Behavioral", instance_name="Ride Fare Pricing",
        participant_roles=("Strategy=FareStrategy; ConcreteStrategies=OneWayFare, RoundTripFare, HourlyFare, OutstationFare; "
                           "Context=FareCalculatorService (registry Map<BookingType, FareStrategy>, register()); "
                           "Clients=BookDriver, GetEstimatedFare, UpdateBookingStatus (finalFare)"),
        source_locations=(E + "domain/pricing/FareStrategy.ts:15-68; " + E + "infrastructure/services/FareCalculatorService.ts:10-35; "
                          + E + "application/services/FareCalculatorService.ts:4-7; " + E + "application/use_cases/User/BookDriver.ts:100-106; "
                          + E + "application/use_cases/Driver/UpdateBookingstatus.ts:60-64"),
        intent_and_evidence=("One class per ride type computes the base fare and exposes its extra-km rate. FareCalculatorService looks "
                             "the strategy up by bookingType; a new ride type is a new class plus one register() call. The 6 baseline "
                             "characterization tests in tests/fare.test.ts still pass unchanged (behaviour preserved for ONE_WAY/ROUND_TRIP)."),
        status="newly_introduced",
        change=("Requirement CH03 (multiple ride types). Replaces the if/else in FareCalculatorService.calculate (the rejected Strategy "
                "candidate of the baseline) and the duplicated ratePerKm = 10 in UpdateBookingStatus."))),
    ("After CH03", dict(
        pattern_name="Decorator", pattern_type="Structural", instance_name="Dynamic Fare Pricing",
        participant_roles=("Component=FareStrategy; ConcreteComponents=OneWayFare/RoundTripFare/HourlyFare/OutstationFare; "
                           "Decorator=FareDecorator (holds inner FareStrategy); ConcreteDecorators=PeakHourSurcharge, LowSupplySurcharge; "
                           "Client=FareCalculatorService.calculate (wraps the selected strategy)"),
        source_locations=(E + "domain/pricing/DynamicPricing.ts:7-40; " + E + "infrastructure/services/FareCalculatorService.ts:22-25; "
                          + E + "domain/pricing/FareStrategy.ts:15-19"),
        intent_and_evidence=("Pricing rules wrap any ride-type strategy with the same interface: PeakHourSurcharge multiplies by 1.25 for "
                             "starts 08:00-10:59 and 17:00-20:59 IST, LowSupplySurcharge by 1.2 when fewer than 3 drivers are in range; "
                             "they stack (60 km evening ride with 1 driver: 600 -> 750 -> 900). tests/pricing.test.ts."),
        status="newly_introduced",
        change="Requirement CH03 (dynamic pricing). BookDriver now prices after matching so availableDrivers is known.")),
]
