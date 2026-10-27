package jakarta.validation.constraints;
import java.lang.annotation.*;
@Retention(RetentionPolicy.RUNTIME) @Target({ElementType.FIELD})
public @interface NotNull { String message() default ""; }
