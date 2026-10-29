#include <functional>
#include <string>
#include <unordered_set>

using Guard = std::function<bool(const std::string*)>;

Guard createGuard(
    const std::initializer_list<std::string>& allowedRoles
) {
    const std::unordered_set<std::string> allowed(
        allowedRoles.begin(),
        allowedRoles.end()
    );

    return [allowed](const std::string* userRole) -> bool {
        if (userRole == nullptr) {
            return false;
        }

        return allowed.find(*userRole) != allowed.end();
    };
}