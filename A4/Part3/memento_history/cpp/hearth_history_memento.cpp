#include "hearth_history_memento.hpp"

DashboardConfig::DashboardConfig(std::string title, std::string theme, std::vector<std::string> widgets)
    : title(std::move(title)), theme(std::move(theme)), widgets(std::move(widgets)) {}

const std::string& DashboardConfig::getTitle() const { return title; }
const std::string& DashboardConfig::getTheme() const { return theme; }
const std::vector<std::string>& DashboardConfig::getWidgets() const { return widgets; }

bool DashboardConfig::operator==(const DashboardConfig& other) const {
    return title == other.title && theme == other.theme && widgets == other.widgets;
}

bool DashboardConfig::operator!=(const DashboardConfig& other) const {
    return !(*this == other);
}
