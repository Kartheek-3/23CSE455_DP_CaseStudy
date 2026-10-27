import java.util.ArrayList;
import java.util.List;

// State pattern (GoF, behavioural) -- EV charging session lifecycle.
// Production snippet. Tests live in StateTest.java.

public interface EvChargingState {
    String name();

    default String plugIn(ChargingSession ctx) {
        return ctx.fail("plugIn", name());
    }

    default String startCharge(ChargingSession ctx) {
        return ctx.fail("startCharge", name());
    }

    default String finishCharge(ChargingSession ctx) {
        return ctx.fail("finishCharge", name());
    }

    default String removeCable(ChargingSession ctx) {
        return ctx.fail("removeCable", name());
    }
}

class IdleState implements EvChargingState {
    public String name() {
        return "idle";
    }

    public String plugIn(ChargingSession ctx) {
        ctx.setState(new PluggedInState());
        return "plugged_in";
    }
}

class PluggedInState implements EvChargingState {
    public String name() {
        return "plugged_in";
    }

    public String startCharge(ChargingSession ctx) {
        ctx.setState(new ChargingActiveState());
        return "charging";
    }

    public String removeCable(ChargingSession ctx) {
        ctx.setState(new IdleState());
        return "idle";
    }
}

class ChargingActiveState implements EvChargingState {
    public String name() {
        return "charging";
    }

    public String finishCharge(ChargingSession ctx) {
        ctx.setState(new CompletedState());
        return "completed";
    }
}

class CompletedState implements EvChargingState {
    public String name() {
        return "completed";
    }

    public String removeCable(ChargingSession ctx) {
        ctx.setState(new IdleState());
        return "idle";
    }
}

class ChargingSession {
    private EvChargingState state = new IdleState();
    final List<String> errors = new ArrayList<>();

    void setState(EvChargingState state) {
        this.state = state;
    }

    String state() {
        return state.name();
    }

    String fail(String event, String fromState) {
        errors.add(event + "@" + fromState);
        return "error";
    }

    String plugIn() {
        return state.plugIn(this);
    }

    String startCharge() {
        return state.startCharge(this);
    }

    String finishCharge() {
        return state.finishCharge(this);
    }

    String removeCable() {
        return state.removeCable(this);
    }
}
