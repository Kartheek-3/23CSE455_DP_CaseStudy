#include "nodes.hpp"

#include <algorithm>
#include <utility>

namespace {

std::string indent(int depth) {
    return std::string(static_cast<std::size_t>(depth) * 2, ' ');
}

}  // namespace

TestCase::TestCase(std::string name, std::vector<std::string> tags)
    : TestNode(std::move(name)), tags_(std::move(tags)) {}

bool TestCase::has_tag(const std::string& tag) const {
    return std::find(tags_.begin(), tags_.end(), tag) != tags_.end();
}

std::string TestCase::render(int depth) const {
    std::string line = indent(depth) + "test " + name();
    for (const auto& tag : tags_) line += " @" + tag;
    return line + "\n";
}

TestContainer::TestContainer(std::string kind, std::string name)
    : TestNode(std::move(name)), kind_(std::move(kind)) {}

TestNode& TestContainer::add_child(std::unique_ptr<TestNode> child) {
    children_.push_back(std::move(child));
    return *children_.back();
}

int TestContainer::count_tests() const {
    int tests = 0;
    for (const auto& child : children_) tests += child->count_tests();
    return tests;
}

void TestContainer::remove_tests_tagged(const std::string& tag, std::vector<std::string>& removed) {
    std::erase_if(children_, [&](const std::unique_ptr<TestNode>& child) {
        if (child->has_tag(tag)) {
            removed.push_back(child->name());
            return true;
        }
        child->remove_tests_tagged(tag, removed);
        return false;
    });
}

void TestContainer::prune_empty(std::vector<std::string>& pruned) {
    std::erase_if(children_, [&](const std::unique_ptr<TestNode>& child) {
        child->prune_empty(pruned);
        if (child->count_tests() > 0) return false;
        pruned.push_back(child->name());
        return true;
    });
}

std::string TestContainer::render(int depth) const {
    int tests = count_tests();
    std::string out = indent(depth) + kind_ + " " + name() + " (" + std::to_string(tests)
                      + (tests == 1 ? " test)" : " tests)") + "\n";
    for (const auto& child : children_) out += child->render(depth + 1);
    return out;
}
