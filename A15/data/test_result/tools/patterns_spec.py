"""Single source of truth for pattern instances. Every participant is (role, symbol, relative_path); line ranges are
computed from the real source by javaloc, never typed by hand."""
M = "src/main/java/br/com/michaelcruz/"
def p(rel): return M + rel

AC, UC = "rest/AccountController.java", "rest/UserController.java"
AS, US = "service/AccountService.java", "service/UserService.java"
AU, UU = "util/AccountUtil.java", "util/UserUtil.java"
AD, UD, D = "persistence/dao/AccountDAO.java", "persistence/dao/UserDAO.java", "persistence/dao/DAO.java"
ACC, USR = "persistence/model/Account.java", "persistence/model/User.java"
ADTO, UDTO, TDTO = "persistence/dto/AccountDTO.java", "persistence/dto/UserDTO.java", "persistence/dto/TransactionDTO.java"
BRE, NFE = "exception/BadRequestException.java", "exception/NotFoundException.java"

V0 = [
 dict(key="DAO", vrole="ConcreteDAO", name="Account and User Persistence DAO", pattern="Data Access Object", ptype="Enterprise (Core J2EE)",
  origin="application", variant="ConcreteDAO",
  roles=[("DataAccessObject","DAO",D),("ConcreteDAO","AccountDAO",AD),("ConcreteDAO","UserDAO",UD),
         ("DataSource","AccountDAO.entityManager",AD),("DataSource","UserDAO.entityManager",UD),
         ("TransferObject","Account",ACC),("TransferObject","User",USR),
         ("BusinessObject","AccountService",AS),("BusinessObject","UserService",US),
         ("Operation","AccountDAO.findById",AD),("Operation","AccountDAO.save",AD),("Operation","AccountDAO.update",AD),("Operation","AccountDAO.getAll",AD),
         ("Operation","UserDAO.findById",UD),("Operation","UserDAO.save",UD),("Operation","UserDAO.getAll",UD)],
  external=[],
  problem="Keep persistence calls (find/persist/merge/query) out of the business layer behind a small entity-oriented API.",
  evidence="AccountDAO/UserDAO wrap entityManager.find/persist/merge/createQuery; services call only DAO methods and never reference EntityManager (grep C2); DAO<T> declares the shared findById/getAll contract, but save/update exist only on the concrete DAOs, so services inject the concrete classes (weakened abstraction). Tests replace the EntityManager by an in-memory fake without touching production code."),
 dict(key="DTO", vrole="DataTransferObject", name="API Payload DTO Assembly", pattern="Data Transfer Object", ptype="Enterprise (Fowler PoEAA / Core J2EE)",
  origin="application", variant="DataTransferObject",
  roles=[("DataTransferObject","UserDTO",UDTO),("DataTransferObject","AccountDTO",ADTO),("DataTransferObject","TransactionDTO",TDTO),
         ("Assembler","UserUtil.convertToUserDTO",UU),("Assembler","AccountUtil.convertToAccount",AU),("Assembler","UserService.createUser",US),
         ("DomainObject","User",USR),("DomainObject","Account",ACC),
         ("Consumer","AccountController.createAccount",AC),("Consumer","AccountController.depositToAccount",AC),("Consumer","AccountController.withdraw",AC),("Consumer","UserController.createUser",UC)],
  external=[],
  problem="Decouple the JSON request contract from the persistence entities and carry only the needed fields across the REST boundary.",
  evidence="The three DTO classes hold fields, validation annotations and accessors only; controller methods take DTOs as parameters; convertToUserDTO, convertToAccount and UserService.createUser copy field-by-field between DTO and entity. Partial: listAccounts returns Account entities directly (output side has no DTO)."),
 dict(key="SL", vrole="ServiceLayer", name="Banking Use-Case Service Layer", pattern="Service Layer", ptype="Enterprise (Fowler PoEAA)",
  origin="application", variant="Service",
  roles=[("ServiceLayer","AccountService",AS),("ServiceLayer","UserService",US),
         ("Client","AccountController",AC),("Client","UserController",UC),
         ("Operation","AccountService.createAccount",AS),("Operation","AccountService.depositToAccount",AS),("Operation","AccountService.withdraw",AS),("Operation","AccountService.listAllAccounts",AS),
         ("Operation","UserService.createUser",US),("Operation","UserService.getUserDetails",US),
         ("Collaborator","AccountService.accountDAO",AS),("Collaborator","AccountService.userService",AS),("Collaborator","AccountService.accountUtil",AS),
         ("Collaborator","UserService.userDAO",US),("Collaborator","UserService.userUtil",US)],
  external=[],
  problem="Provide one application boundary that exposes the use cases and coordinates DAOs and converters for the controllers.",
  evidence="Controllers call only AccountService/UserService; AccountService.createAccount coordinates userService.getUserDetails, accountUtil.convertToAccount and accountDAO.save. Deviation: transaction demarcation is on DAO methods, not on the service operations."),
 dict(key="TS", vrole="TransactionScript", name="Account Deposit and Withdrawal Script", pattern="Transaction Script", ptype="Enterprise (Fowler PoEAA)",
  origin="application", variant="TransactionScript host",
  roles=[("TransactionScript","AccountService.depositToAccount",AS),("TransactionScript","AccountService.withdraw",AS),("TransactionScript","AccountService.createAccount",AS),
         ("TransactionScript","UserService.createUser",US),("RowData","Account",ACC)],
  external=[],
  problem="Implement each use case as one procedure that applies the business rules directly to row-like data.",
  evidence="Rules are inline in the service methods: amount > 0 (AccountService line 43), savings bonus += 0.5 (lines 46-48), withdraw allowed only if amount > 0 && balance > amount (line 67). Account contains only accessors (grep C9), i.e. an anemic entity."),
 dict(key="CTRL", vrole="Controller", name="REST Use-Case Controller", pattern="Controller", ptype="GRASP",
  origin="application", variant="Controller",
  roles=[("Controller","AccountController",AC),("Controller","UserController",UC),
         ("SystemOperation","AccountController.createAccount",AC),("SystemOperation","AccountController.depositToAccount",AC),("SystemOperation","AccountController.withdraw",AC),("SystemOperation","AccountController.listAccounts",AC),
         ("SystemOperation","UserController.createUser",UC),
         ("Delegate","AccountController.accountService",AC),("Delegate","UserController.userService",UC)],
  external=[],
  problem="Receive HTTP system events and hand them to the business layer without business logic in the HTTP layer.",
  evidence="Each controller method unwraps the DTO, makes exactly one service call and wraps the result in a Response (grep C5); no DAO or EntityManager reference in rest/ (grep C1)."),
 dict(key="DI", vrole="ManagedBean", name="CDI Field Injection Wiring", pattern="Dependency Injection", ptype="Framework idiom (CDI / IoC)",
  origin="framework (Quarkus ArC / Jakarta CDI)", variant="ManagedBean",
  roles=[("Container","(Quarkus ArC CDI container - dependency, not in application source)",None),
         ("InjectionPoint","AccountController.accountService",AC),("InjectionPoint","UserController.userService",UC),
         ("InjectionPoint","AccountService.accountDAO",AS),("InjectionPoint","AccountService.userService",AS),("InjectionPoint","AccountService.accountUtil",AS),
         ("InjectionPoint","UserService.userDAO",US),("InjectionPoint","UserService.userUtil",US),
         ("InjectionPoint","AccountDAO.entityManager",AD),("InjectionPoint","UserDAO.entityManager",UD),
         ("InjectionPoint","AccountUtil.accountDAO",AU),("InjectionPoint","UserUtil.userDAO",UU),
         ("ManagedBean","AccountController",AC),("ManagedBean","UserController",UC),
         ("ManagedBean","AccountService",AS),("ManagedBean","UserService",US),
         ("ManagedBean","AccountUtil",AU),("ManagedBean","UserUtil",UU),
         ("ManagedBean","AccountDAO",AD),("ManagedBean","UserDAO",UD)],
  external=["Container"],
  problem="Let the container create and wire collaborators so that classes depend on types, not on construction.",
  evidence="No collaborator is created with new (grep C3 lists only data objects and exceptions); every collaborator is an @Inject field; the unit tests build the same classes in a MiniContainer and inject an in-memory EntityManager without changing production code. Dead injection points: AccountUtil.accountDAO and UserUtil.userDAO are never used (grep C4)."),
 dict(key="ET", vrole="TranslatedException", name="HTTP Error Translation", pattern="Exception Translation", ptype="Framework idiom (JAX-RS)",
  origin="framework (JAX-RS WebApplicationException) + application", variant="TranslatedException",
  roles=[("TranslatedException","BadRequestException",BRE),("TranslatedException","NotFoundException",NFE),
         ("Raiser","AccountService.depositToAccount",AS),("Raiser","AccountService.withdraw",AS),("Raiser","AccountDAO.findById",AD),("Raiser","UserService.getUserDetails",US),
         ("Translator","(JAX-RS runtime - dependency, not in application source)",None)],
  external=["Translator"],
  problem="Convert business failures into HTTP 400/404 responses with a message body.",
  evidence="Both exceptions extend WebApplicationException and build Response(status, message) in the constructor; service/DAO code throws them; unit tests assert getResponse().getStatus() 400/404 and the entity text. The runtime half (JAX-RS turning the exception into the HTTP reply) is framework behaviour and was not executed in the sandbox."),
]

REJECTED_V0 = [
 ("Builder (Response.status().entity().build())","Member 1","Builder is implemented by JAX-RS; controllers are only clients."),
 ("Front Controller","Member 1","No dispatcher class in the supplied code; dispatching is framework-internal."),
 ("Strategy (savings bonus)","Member 2","Single if on an enum value at AccountService 46-48; no strategy interface or interchangeable family."),
 ("Factory Method / Simple Factory (AccountUtil.convertToAccount)","Member 2","Field mapping only; no product hierarchy or creation choice."),
 ("Adapter (*Util classes)","Member 2","They convert data, they do not adapt an incompatible interface."),
 ("GoF Singleton (@ApplicationScoped beans)","Member 2","No private constructor / static instance; lifetime is container-managed (covered by Dependency Injection)."),
 ("Active Record","Member 3","Account and User contain no persistence behaviour."),
 ("Repository as separate instance","Member 3","Same collaboration as the DAO under another name; classes expose save/update, not collection-like add/remove."),
 ("Null Object (Optional from findById)","Member 3","Optional.of(null) throws NullPointerException; no neutral object exists."),
 ("Layered Architecture as separate instance","Team (integration)","Would double-count Controller + Service Layer + DAO, which are already counted; used as the architecture description instead."),
]
UNCERTAIN_V0 = [
 ("Facade (AccountService.createAccount)","Member 2","Hides three collaborators behind one call, but that is the ordinary job of a service method already counted as Service Layer."),
 ("Data Mapper (JPA EntityManager / Hibernate)","Member 3","The mapper is inside the persistence provider; application code only supplies mapping annotations."),
 ("Interceptor via @Transactional (AccountDAO 30/35, UserDAO 28)","Member 3","Annotation-only evidence; interceptor lives in a dependency and was not executed in the sandbox."),
]

# relationships used only to draw diagrams. EDGES = role-level (valid cross products only); EXTRA = literal symbol edges.
EDGES = {"TS": [("TransactionScript","RowData","reads / updates",0)]}
SKIP_ROLES = {"Operation","SystemOperation","InjectionPoint","Collaborator","Delegate","DataSource"}
EXTRA = {
 "DAO": [("AccountService","AccountDAO","calls",0),("UserService","UserDAO","calls",0),
         ("AccountDAO","DAO","implements",1),("UserDAO","DAO","implements",1),
         ("AccountDAO","Account","persists",0),("UserDAO","User","persists",0),
         ("AccountDAO","EntityManager","uses (injected)",0),("UserDAO","EntityManager","uses (injected)",0)],
 "DTO": [("AccountController.createAccount","AccountDTO","receives",0),("AccountController.depositToAccount","TransactionDTO","receives",0),
         ("AccountController.withdraw","TransactionDTO","receives",0),("UserController.createUser","UserDTO","receives",0),
         ("UserUtil.convertToUserDTO","UserDTO","builds",0),("UserUtil.convertToUserDTO","User","reads",0),
         ("AccountUtil.convertToAccount","Account","builds",0),("AccountUtil.convertToAccount","AccountDTO","reads",0),
         ("UserService.createUser","User","builds",0),("UserService.createUser","UserDTO","reads",0)],
 "SL": [("AccountController","AccountService","calls",0),("UserController","UserService","calls",0),
        ("AccountService","AccountDAO","uses",0),("AccountService","UserService","uses",0),("AccountService","AccountUtil","uses",0),
        ("UserService","UserDAO","uses",0),("UserService","UserUtil","uses",0)],
 "CTRL": [("AccountController","AccountService","delegates",0),("UserController","UserService","delegates",0)],
 "DI": [("(Quarkus ArC CDI container - dependency, not in application source)","AccountController","creates + injects all beans",0),
        ("(Quarkus ArC CDI container - dependency, not in application source)","UserController","",0),
        ("AccountController","AccountService","@Inject",0),("UserController","UserService","@Inject",0),
        ("AccountService","AccountDAO","@Inject",0),("AccountService","UserService","@Inject",0),("AccountService","AccountUtil","@Inject",0),
        ("UserService","UserDAO","@Inject",0),("UserService","UserUtil","@Inject",0),
        ("AccountDAO","EntityManager","@Inject",0),("UserDAO","EntityManager","@Inject",0),
        ("AccountUtil","AccountDAO","@Inject (unused)",1),("UserUtil","UserDAO","@Inject (unused)",1)],
 "ET": [("AccountService.depositToAccount","BadRequestException","throws",0),("AccountService.withdraw","BadRequestException","throws",0),
        ("AccountService.depositToAccount","NotFoundException","throws",0),("AccountService.withdraw","NotFoundException","throws",0),
        ("AccountDAO.findById","NotFoundException","throws",0),("UserService.getUserDetails","NotFoundException","throws",0),
        ("BadRequestException","(JAX-RS runtime - dependency, not in application source)","status+body read by",1),
        ("NotFoundException","(JAX-RS runtime - dependency, not in application source)","status+body read by",1)],
}
