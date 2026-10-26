package adapter;

record TestIdentifier(String displayName, boolean isTest, String parentName) {
    String describe() {
        return (isTest ? "test " : "container ") + displayName + (parentName == null ? "" : " (in " + parentName + ")");
    }
}
